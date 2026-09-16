from datetime import datetime , date
from sqlalchemy import (
    String,
    ForeignKey,
    Text,
    TIMESTAMP,
    func,
    Boolean,
    Integer,
    Date
)
from sqlalchemy.orm import (
    Mapped,
    mapped_column
)

from app.database import Base

class User(Base) :
    __tablename__ = "users"
    __table_args__ = {"schema": "openaccount"}

    uid : Mapped[int] = mapped_column(          # 系统用户编号
        primary_key=True
    )

    user_phone : Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    user_id : Mapped[str] = mapped_column(      # 身份证号
        String(50),
        nullable=False,
        unique=True
    )

    user_created_at : Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now()
    )

    user_modified_at : Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now(),
        onupdate=func.now(),
    )

class launderingBackAnswer(Base) :
    __tablename__ = "launderingbackanswers"
    __table_args__ = {"schema": "openaccount"}

    serial_number : Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    uid : Mapped[int] = mapped_column(
        ForeignKey("openaccount.users.uid"),
        nullable=False
    )

    ans_created_at : Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now()
    )

    p1 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p2 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p3 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p4 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p5 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p6 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p7 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p8 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p9 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

class addInfoAnswer(Base) :
    __tablename__ = "addinfoanswers"
    __table_args__ = {"schema": "openaccount"}

    serial_number : Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    uid : Mapped[int] = mapped_column(
        ForeignKey("openaccount.users.uid"),
        nullable=False
    )

    ans_created_at : Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now()
    )

    name : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    idCardNumber : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    idCardAddress : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    idCardValidPeriodStart : Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    idCardValidPeriodEnd : Mapped[date | None] = mapped_column(
        Date,
        nullable=True
    )

    ifIdCardPermanentlyValid : Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )

    contactAddressProvince : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    contactAddressCity : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    contactAddress : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    postalCode : Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    departmentProvince : Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default="湖北省"
    )

    departmentCity : Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default="武汉市"
    )

    departmentCategory : Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default="0",
    )

    departmentName : Mapped[str] = mapped_column(
        Text,
        nullable=False,
        server_default="2015"
    )

    contactnumber : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    emailAddress : Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    occupation : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    educationalQualification : Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    ifIntermediary : Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )

    intermediaryName : Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    intermediaryCode : Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    referencePersonCode : Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    referencePersonName : Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

class questionAnswer(Base) :
    __tablename__ = "questionanswers"
    __table_args__ = {"schema": "openaccount"}

    serial_number : Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    uid : Mapped[int] = mapped_column(
        ForeignKey("openaccount.users.uid"),
        nullable=False
    )

    ans_created_at : Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now()
    )

    p1 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p2 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p3 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p4 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p5 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p6 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p7 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p8 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p9 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p10 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p11 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p12 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p13 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

    p14 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )

class chooseFuturesAnswer(Base) :
    __tablename__ = "choosefuturesanswers"
    __table_args__ = {"schema": "openaccount"}

    serial_number : Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    uid : Mapped[int] = mapped_column(
        ForeignKey("openaccount.users.uid"),
        nullable=False
    )

    ans_created_at : Mapped[datetime] = mapped_column(
        TIMESTAMP,
        server_default=func.now()
    )

    p1 : Mapped[str] = mapped_column(
        String(10),
        nullable=False
    )