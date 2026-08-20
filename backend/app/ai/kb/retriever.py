from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.ai.kb.data import SAMPLE_ENTITIES

class CandidateRetriever(ABC):
    @abstractmethod
    def retrieve(self, category: str, extracted_attributes: Dict[str, Any], query: str) -> List[str]:
        pass

class LocalCandidateRetriever(CandidateRetriever):
    def retrieve(self, category: str, extracted_attributes: Dict[str, Any], query: str) -> List[str]:
        candidates = []
        
        # 1. Filter by category
        # If category is plural or slightly different, do a basic check (e.g. 'person' in 'people')
        # In a real app we'd map category strings carefully, here we just do a simple inclusion check
        
        for entity in SAMPLE_ENTITIES:
            # Basic category matching (e.g. if requested 'people', match 'person')
            cat = entity["category"].lower()
            req_cat = category.lower()
            if cat not in req_cat and req_cat not in cat:
                if req_cat == "people" and cat != "person":
                    continue
                elif req_cat != "people":
                    continue
            
            # 2. Deterministic Attribute Filtering
            match = True
            for attr_key, attr_val in extracted_attributes.items():
                if attr_key in entity["attributes"]:
                    # Strict match: if entity has the attribute, it must equal the requested value
                    if str(entity["attributes"][attr_key]).lower() != str(attr_val).lower():
                        match = False
                        break
                # If entity doesn't have the attribute defined, we keep it to be safe.
                
            if match:
                candidates.append(entity["name"])
                
        # 3. Semantic Retrieval (Fallback/Ordering)
        # Since this is a simple local retriever without Chroma/Pinecone yet, 
        # we will just return the deterministically filtered names.
        # A real semantic ranker would embed `query` and compare with entity["description"].
        
        return candidates
