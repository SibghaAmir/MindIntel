from pydantic import BaseModel
from typing import List

class DeadDrop(BaseModel):
    id: str
    creator: str
    subject: str
    bounty: int
    category: str

class CreateDeadDropRequest(BaseModel):
    creator: str
    subject: str
    bounty: int
    category: str

dead_drops_db: List[DeadDrop] = [
    DeadDrop(id="dd-1", creator="Cipher", subject="The Antikythera Mechanism", bounty=500, category="history"),
    DeadDrop(id="dd-2", creator="Ghost", subject="Quantum Entanglement", bounty=1000, category="science")
]

def create_dead_drop(request: CreateDeadDropRequest) -> DeadDrop:
    import uuid
    drop = DeadDrop(
        id=f"dd-{uuid.uuid4().hex[:8]}",
        creator=request.creator,
        subject=request.subject,
        bounty=request.bounty,
        category=request.category
    )
    dead_drops_db.append(drop)
    return drop

def get_dead_drops() -> List[DeadDrop]:
    return dead_drops_db

def get_dead_drop(drop_id: str) -> DeadDrop:
    for drop in dead_drops_db:
        if drop.id == drop_id:
            return drop
    return None
