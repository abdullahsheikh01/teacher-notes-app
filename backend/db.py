from datetime import datetime, timezone

from sqlmodel import Field, SQLModel, create_engine, Session

engine = create_engine(
    "sqlite:///./notes.db",
    connect_args={"check_same_thread": False},
)


class Note(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    task: str = "generate"
    subject: str = ""
    topic: str = ""
    grade: str = ""
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
