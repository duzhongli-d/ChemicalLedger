import re
from io import BytesIO
from PIL import Image
from typing import Optional
from app.core.config import get_settings

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False


# Field patterns for structured extraction from raw OCR text
FIELD_PATTERNS = {
    "product_name": [
        r"品名[:：]\s*(.+?)(?:\n|$)",
        r"产品名称[:：]\s*(.+?)(?:\n|$)",
        r"名称[:：]\s*(.+?)(?:\n|$)",
    ],
    "batch_no": [
        r"批号[:：]\s*([A-Za-z0-9\-]+)",
        r"批(?:号|次)[:：]\s*([A-Za-z0-9\-]+)",
        r"LOT[:.\s]*([A-Za-z0-9\-]+)",
        r"Batch[:.\s]*([A-Za-z0-9\-]+)",
    ],
    "cas_no": [
        r"\b(\d{2,7}-\d{2}-\d)\b",
        r"CAS[:.\s]*(\d{2,7}-\d{2}-\d)",
    ],
    "weight_capacity": [
        r"(?:重量|容量|规格|净含量)[:：]\s*([\d.]+\s*(?:g|kg|mg|mL|L|μg|ng|mmol|mol)[A-Za-z]*)",
        r"([\d.]+\s*(?:g|kg|mg|mL|L|μg|ng|mmol|mol))",
    ],
    "supplier": [
        r"供应商[:：]\s*(.+?)(?:\n|$)",
        r"厂家[:：]\s*(.+?)(?:\n|$)",
        r"生产(?:厂商|厂家|商)[:：]\s*(.+?)(?:\n|$)",
    ],
}


def _try_extract(text: str, field: str) -> Optional[str]:
    """Try each regex pattern for a field, return first match."""
    for pattern in FIELD_PATTERNS.get(field, []):
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return m.group(1).strip()
    return None


async def process_image(file_bytes: bytes) -> dict:
    """
    Extract structured reagent fields from a label image.

    1. Run Tesseract OCR to get raw text
    2. Apply regex patterns for each field
    3. Return extracted fields
    """
    if not TESSERACT_AVAILABLE:
        return {
            "product_name": "",
            "batch_no": "",
            "cas_no": "",
            "weight_capacity": "",
            "supplier": "",
            "_warning": "Tesseract not available, OCR disabled",
        }

    settings = get_settings()
    image = Image.open(BytesIO(file_bytes))

    # Run Tesseract OCR — Chinese + English
    raw_text = pytesseract.image_to_string(
        image,
        lang="chi_sim+eng",
        config="--psm 4 --oem 3",
    )

    # Normalize whitespace
    text = re.sub(r"\s+", " ", raw_text).strip()

    result = {
        "product_name": _try_extract(text, "product_name") or "",
        "batch_no": _try_extract(text, "batch_no") or "",
        "cas_no": _try_extract(text, "cas_no") or "",
        "weight_capacity": _try_extract(text, "weight_capacity") or "",
        "supplier": _try_extract(text, "supplier") or "",
    }

    return result


async def process_image_with_llm_refine(
    file_bytes: bytes,
    raw_text: Optional[str] = None,
) -> dict:
    """
    Two-stage extraction:
    1. Tesseract for raw text
    2. LLM (LangChain) to parse structured fields from text

    Falls back to pure regex if LLM is unavailable.
    """
    if raw_text is None:
        if not TESSERACT_AVAILABLE:
            return {
                "product_name": "",
                "batch_no": "",
                "cas_no": "",
                "weight_capacity": "",
                "supplier": "",
            }
        image = Image.open(BytesIO(file_bytes))
        raw_text = pytesseract.image_to_string(image, lang="chi_sim+eng")

    # Try LangChain LLM refinement if key is configured
    settings = get_settings()
    if settings.NOTEBOOKLM_API_KEY:
        try:
            return await _llm_refine(raw_text)
        except Exception:
            pass

    # Fallback to regex
    return {
        "product_name": _try_extract(raw_text, "product_name") or "",
        "batch_no": _try_extract(raw_text, "batch_no") or "",
        "cas_no": _try_extract(raw_text, "cas_no") or "",
        "weight_capacity": _try_extract(raw_text, "weight_capacity") or "",
        "supplier": _try_extract(raw_text, "supplier") or "",
    }


async def _llm_refine(text: str) -> dict:
    """Use LangChain LLM to extract structured fields from raw OCR text."""
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_openai import ChatOpenAI

    settings = get_settings()

    prompt = ChatPromptTemplate.from_template(
        """从以下试剂标签的OCR识别文本中，提取结构化字段。
如果某个字段无法识别，返回空字符串。

OCR文本:
{text}

请以JSON格式返回，字段名: product_name(品名), batch_no(批号), cas_no(CAS号), weight_capacity(重量/容量), supplier(供应商)。
只返回JSON，不要有其他文字。"""
    )

    # Use a simple model for structured extraction
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=settings.NOTEBOOKLM_API_KEY,
        temperature=0,
    )

    chain = prompt | llm
    response = await chain.ainvoke({"text": text})
    content = response.content.strip()

    # Parse JSON from response
    import json
    json_match = re.search(r"\{[\s\S]*\}", content)
    if json_match:
        data = json.loads(json_match.group())
        return {
            "product_name": data.get("product_name", ""),
            "batch_no": data.get("batch_no", ""),
            "cas_no": data.get("cas_no", ""),
            "weight_capacity": data.get("weight_capacity", ""),
            "supplier": data.get("supplier", ""),
        }

    return {
        "product_name": "",
        "batch_no": "",
        "cas_no": "",
        "weight_capacity": "",
        "supplier": "",
    }
