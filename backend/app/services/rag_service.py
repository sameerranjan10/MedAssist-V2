"""
app/services/rag_service.py
RAG-powered chatbot: report text → FAISS vector store → contextual Q&A.

Pipeline:
  OCR text  →  chunk  →  embed (SentenceTransformers)  →  FAISS
  User question  →  similarity search  →  Groq/Llama3 answer
"""
import logging
import os
from typing import List, Dict

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain_groq import ChatGroq
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory

from app.core.config import settings

logger = logging.getLogger(__name__)

CHATBOT_SYSTEM_PROMPT = """You are MedAssist Chat, a helpful medical report assistant.
You help patients understand their lab reports in simple, friendly language.

IMPORTANT RULES:
1. Answer ONLY based on the provided report context. 
2. If the answer is not in the report, say "I don't see that information in your report."
3. Never diagnose diseases or prescribe medication.
4. Always recommend consulting a doctor for medical decisions.
5. Keep answers concise (under 100 words).
6. Be warm, supportive, and easy to understand.
"""


class RAGService:
    """Manages per-report vector stores and conversational retrieval chains."""

    def __init__(self):
        # Shared embedding model (downloaded once, cached locally)
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            cache_folder="./.cache/embeddings",
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500, chunk_overlap=100,
            separators=["\n\n", "\n", ".", " "]
        )
        self.llm = ChatGroq(
            groq_api_key=settings.GROQ_API_KEY,
            model_name=settings.GROQ_MODEL,
            temperature=0.2,
            max_tokens=400,
        )
        # In-memory store: report_id → FAISS vector store
        self._stores: Dict[int, FAISS] = {}
        # Conversation memories per (report_id, user_id)
        self._memories: Dict[str, ConversationBufferMemory] = {}

    # ── Build / refresh vector store ───────────────────────────────────────────

    def index_report(self, report_id: int, ocr_text: str) -> None:
        """
        Chunk the OCR text and build a FAISS index for this report.
        Call this after OCR completes.
        """
        if not ocr_text.strip():
            logger.warning(f"Empty OCR text for report {report_id}, skipping indexing.")
            return

        chunks = self.text_splitter.split_text(ocr_text)
        documents = [
            Document(page_content=chunk, metadata={"report_id": report_id, "chunk": i})
            for i, chunk in enumerate(chunks)
        ]
        vector_store = FAISS.from_documents(documents, self.embeddings)
        self._stores[report_id] = vector_store
        logger.info(f"Indexed {len(chunks)} chunks for report {report_id}")

    # ── Answer a question ──────────────────────────────────────────────────────

    def answer(self, report_id: int, user_id: int, question: str) -> str:
        """
        Retrieve relevant chunks and generate an answer using Llama3.
        Maintains per-(report, user) conversation history.
        """
        store = self._stores.get(report_id)
        if store is None:
            return (
                "I haven't been able to index your report yet. "
                "Please wait a moment and try again."
            )

        memory_key = f"{report_id}:{user_id}"
        if memory_key not in self._memories:
            self._memories[memory_key] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer",
            )

        retriever = store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4},
        )

        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=self._memories[memory_key],
            return_source_documents=False,
            verbose=False,
            combine_docs_chain_kwargs={
                "prompt": self._build_prompt()
            },
        )

        try:
            result = chain.invoke({"question": question})
            return result.get("answer", "I could not generate an answer. Please try again.")
        except Exception as e:
            logger.error(f"RAG chain error: {e}")
            return "I encountered an error. Please consult your doctor for questions about this report."

    # ── Prompt builder ─────────────────────────────────────────────────────────

    def _build_prompt(self):
        from langchain.prompts import PromptTemplate
        template = (
            CHATBOT_SYSTEM_PROMPT
            + "\n\nContext from the patient's report:\n{context}\n\n"
            + "Question: {question}\n\nAnswer:"
        )
        return PromptTemplate(input_variables=["context", "question"], template=template)

    # ── Utility ────────────────────────────────────────────────────────────────

    def clear_memory(self, report_id: int, user_id: int) -> None:
        key = f"{report_id}:{user_id}"
        self._memories.pop(key, None)

    def has_index(self, report_id: int) -> bool:
        return report_id in self._stores


# Singleton
rag_service = RAGService()
