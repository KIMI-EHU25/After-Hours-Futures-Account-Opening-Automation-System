from pydantic import BaseModel
from typing import Any

class get_jsinject_data_Response(BaseModel):
    launderingBack: dict[str, Any] | None
    addInfo: dict[str, Any] | None
    question: dict[str, Any] | None
    chooseFutures: dict[str, Any] | None