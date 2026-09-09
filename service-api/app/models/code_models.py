from sqlalchemy import (
    String,
    ForeignKey,
    Text,
    TIMESTAMP,
    func,
    Boolean,
    Integer,
    Date,
    text
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)
from datetime import datetime , date

from app.database import Base

class ProvinceCode(Base) :
    __tablename__ = "provincecodes"
    __table_args__ = {"schema": "openaccount"}

    province_code : Mapped[str] = mapped_column(
        Text,
        primary_key=True,
    )

    name : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class CityCode(Base) :
    __tablename__ = "citycodes"
    __table_args__ = {"schema": "openaccount"}

    province_code : Mapped[str] = mapped_column(
        Text,
        ForeignKey("openaccount.provincecodes.province_code" , ondelete="CASCADE"),
        primary_key=True
    )

    city_code : Mapped[str] = mapped_column(
        Text,
        primary_key=True
    )

    name : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class OccupationCode(Base) :
    __tablename__ = "occupationcodes"
    __table_args__ = {"schema": "openaccount"}

    occupation_code : Mapped[str] = mapped_column(
        Text,
        primary_key=True,
    )

    name : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

class EducationalQualificationCode(Base) :
    __tablename__ = "educationalqualificationcodes"
    __table_args__ = {"schema": "openaccount"}

    educationalqualification_code : Mapped[str] = mapped_column(
        Text,
        primary_key=True
    )

    name : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
