from sqlalchemy import (
    String,
    ForeignKey,
    Text,
    TIMESTAMP,
    UniqueConstraint,
    func,
    Integer
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)
from datetime import datetime

from app.database import Base

class launderingBackTitle(Base) :
    __tablename__ = "launderingbacktitles"
    __table_args__ = {"schema": "openaccount"}

    question_code : Mapped[int] = mapped_column(
        primary_key=True
    )

    type : Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    title : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class launderingBackOption(Base) :
    __tablename__ = "launderingbackoptions"
    __table_args__ = {"schema": "openaccount"}

    question_code : Mapped[int] = mapped_column(
        ForeignKey("openaccount.launderingbacktitles.question_code" , ondelete="CASCADE"),
        primary_key=True
    )

    option : Mapped[str] = mapped_column(
        String(2),
        primary_key=True
    )

    optiontext : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class addInfoTitle(Base) : 
    __tablename__ = "addinfotitles"
    __table_args__ = {"schema": "openaccount"}

    field_id : Mapped[int] = mapped_column(
        primary_key=True
    )

    field_name : Mapped[str] = mapped_column(
        Text,
        nullable=False,
        unique=True
    )

    type : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class questionTitle(Base) : 
    __tablename__ = "questiontitles"
    __table_args__ = {"schema": "openaccount"}

    question_code : Mapped[int] = mapped_column(
        primary_key=True
    )

    type : Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    title : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class questionOption(Base) :
    __tablename__ = "questionoptions"
    __table_args__ = {"schema": "openaccount"}

    question_code : Mapped[int] = mapped_column(
        ForeignKey("openaccount.questiontitles.question_code" , ondelete="CASCADE"),
        primary_key=True
    )

    option : Mapped[str] = mapped_column(
        String(2),
        primary_key=True
    )

    optiontext : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    value : Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )


class chooseFuturesTitle(Base) : 
    __tablename__ = "choosefuturestitles"
    __table_args__ = {"schema": "openaccount"}

    question_code : Mapped[int] = mapped_column(
        primary_key=True
    )

    type : Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    title : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class chooseFuturesOption(Base) :
    __tablename__ = "choosefuturesoptions"
    __table_args__ = {"schema": "openaccount"}

    question_code : Mapped[int] = mapped_column(
        ForeignKey("openaccount.choosefuturestitles.question_code" , ondelete="CASCADE"),
        primary_key=True
    )

    option : Mapped[str] = mapped_column(
        String(2),
        primary_key=True
    )

    optiontext : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )