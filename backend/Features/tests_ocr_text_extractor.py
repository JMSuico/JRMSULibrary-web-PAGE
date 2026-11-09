# [Layer: Tests] — tests_ocr_text_extractor.py
"""
Unit test suite for OCRTextExtractor helper.
Verifies PDF, DOCX, and plain-text extraction, TOC/bookmark parsing,
summary generation, academic keyword extraction, and error resilience.
"""

import os
import tempfile
import unittest
import zipfile
from typing import Any, Dict

from Features.Helpers.ocr_text_extractor import OCRTextExtractor


class OCRTextExtractorTestCase(unittest.TestCase):
    """Comprehensive test cases for OCRTextExtractor."""

    SAMPLE_PDF_BYTES = b"""%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R /Outlines 6 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 260 >> stream
BT
/F1 14 Tf
72 700 Td
(Chapter 1: Artificial Intelligence in Modern Libraries) Tj
0 -30 Td
/F1 10 Tf
(Abstract: This study investigates machine learning algorithms for automated cataloging.) Tj
0 -20 Td
(Neural networks and natural language processing provide high accuracy for library metadata indexing.) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
6 0 obj << /Type /Outlines /First 7 0 R /Last 7 0 R >> endobj
7 0 obj << /Title (Chapter 1: Artificial Intelligence) /Parent 6 0 R /Dest [3 0 R /Fit] >> endobj
xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000074 00000 n 
0000000133 00000 n 
0000000262 00000 n 
0000000574 00000 n 
0000000642 00000 n 
0000000705 00000 n 
trailer << /Size 8 /Root 1 0 R >>
startxref
796
%%EOF"""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)

    def _assert_valid_schema(self, res: Dict[str, Any]) -> None:
        """Asserts that the dictionary matches the expected output schema."""
        expected_keys = {
            "extracted_text",
            "summary",
            "table_of_contents",
            "keywords",
            "page_count",
            "success",
            "error",
        }
        self.assertEqual(set(res.keys()), expected_keys)
        self.assertIsInstance(res["extracted_text"], str)
        self.assertIsInstance(res["summary"], str)
        self.assertIsInstance(res["table_of_contents"], str)
        self.assertIsInstance(res["keywords"], str)
        self.assertIsInstance(res["page_count"], int)
        self.assertIsInstance(res["success"], bool)
        if res["error"] is not None:
            self.assertIsInstance(res["error"], str)

    def test_extract_from_pdf_success(self) -> None:
        pdf_path = os.path.join(self.temp_dir.name, "sample.pdf")
        with open(pdf_path, "wb") as f:
            f.write(self.SAMPLE_PDF_BYTES)

        res = OCRTextExtractor.extract_from_pdf(pdf_path)
        self._assert_valid_schema(res)
        self.assertTrue(res["success"])
        self.assertIsNone(res["error"])
        self.assertEqual(res["page_count"], 1)
        self.assertIn("Artificial Intelligence", res["extracted_text"])
        self.assertIn("Chapter 1: Artificial Intelligence", res["table_of_contents"])
        self.assertTrue(len(res["keywords"]) > 0)
        self.assertIn("algorithms", res["keywords"])

    def test_extract_from_pdf_nonexistent(self) -> None:
        fake_path = os.path.join(self.temp_dir.name, "does_not_exist.pdf")
        res = OCRTextExtractor.extract_from_pdf(fake_path)
        self._assert_valid_schema(res)
        self.assertFalse(res["success"])
        self.assertIsNotNone(res["error"])
        self.assertEqual(res["page_count"], 0)

    def test_extract_from_pdf_corrupt(self) -> None:
        corrupt_path = os.path.join(self.temp_dir.name, "corrupt.pdf")
        with open(corrupt_path, "wb") as f:
            f.write(b"not a valid pdf file content")

        res = OCRTextExtractor.extract_from_pdf(corrupt_path)
        self._assert_valid_schema(res)
        self.assertFalse(res["success"])
        self.assertIsNotNone(res["error"])

    def test_extract_from_docx_success(self) -> None:
        # Create a minimal valid docx in memory
        docx_path = os.path.join(self.temp_dir.name, "test_doc.docx")
        doc_xml = b"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading1"/></w:pPr>
      <w:r><w:t>Chapter 1: Introduction</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Jose Rizal Memorial State University Katipunan Campus Library Research System. This automated repository handles digital theses and references.</w:t></w:r>
    </w:p>
    <w:p>
      <w:pPr><w:pStyle w:val="Heading2"/></w:pPr>
      <w:r><w:t>Section 1.1: System Architecture</w:t></w:r>
    </w:p>
    <w:p>
      <w:r><w:t>Detailed architectural analysis of the indexing algorithms and distributed cache.</w:t></w:r>
    </w:p>
  </w:body>
</w:document>"""

        with zipfile.ZipFile(docx_path, "w") as z:
            z.writestr("word/document.xml", doc_xml)

        res = OCRTextExtractor.extract_from_docx(docx_path)
        self._assert_valid_schema(res)
        self.assertTrue(res["success"])
        self.assertIsNone(res["error"])
        self.assertGreaterEqual(res["page_count"], 1)
        self.assertIn("Jose Rizal Memorial State University", res["extracted_text"])
        self.assertIn("Chapter 1: Introduction", res["table_of_contents"])
        self.assertIn("Section 1.1: System Architecture", res["table_of_contents"])
        self.assertTrue(len(res["keywords"]) > 0)

    def test_extract_from_docx_corrupt(self) -> None:
        corrupt_path = os.path.join(self.temp_dir.name, "corrupt.docx")
        with open(corrupt_path, "wb") as f:
            f.write(b"not a valid zip file")

        res = OCRTextExtractor.extract_from_docx(corrupt_path)
        self._assert_valid_schema(res)
        self.assertFalse(res["success"])
        self.assertIsNotNone(res["error"])

    def test_extract_from_txt(self) -> None:
        txt_path = os.path.join(self.temp_dir.name, "notes.txt")
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(
                "Chapter 1: Principles of Library Science\n\n"
                "Abstract: Knowledge management in modern tertiary education institutions.\n\n"
                "Information science and retrieval systems accelerate academic discovery."
            )

        res = OCRTextExtractor.extract_document_knowledge(txt_path)
        self._assert_valid_schema(res)
        self.assertTrue(res["success"])
        self.assertEqual(res["page_count"], 1)
        self.assertIn("Principles of Library Science", res["table_of_contents"])
        self.assertIn("retrieval", res["keywords"])

    def test_extract_document_knowledge_dispatch(self) -> None:
        # Test dispatch to PDF
        pdf_path = os.path.join(self.temp_dir.name, "sample.pdf")
        with open(pdf_path, "wb") as f:
            f.write(self.SAMPLE_PDF_BYTES)

        res_pdf = OCRTextExtractor.extract_document_knowledge(pdf_path)
        self.assertTrue(res_pdf["success"])

        # Test unsupported format
        img_path = os.path.join(self.temp_dir.name, "photo.png")
        with open(img_path, "wb") as f:
            f.write(b"\x89PNG\r\n\x1a\n")

        res_img = OCRTextExtractor.extract_document_knowledge(img_path)
        self._assert_valid_schema(res_img)
        self.assertFalse(res_img["success"])
        self.assertIn("Unsupported file format", res_img["error"])

    def test_clean_text_sanitization(self) -> None:
        dirty = "Hello\x00World\r\n\r\n\r\n\r\nTest\x07Paragraph"
        cleaned = OCRTextExtractor._clean_text(dirty)
        self.assertNotIn("\x00", cleaned)
        self.assertNotIn("\x07", cleaned)
        self.assertNotIn("\r", cleaned)
        self.assertEqual(cleaned, "HelloWorld\n\nTestParagraph")


if __name__ == "__main__":
    unittest.main()
