from datetime import datetime , date
from sqlalchemy import (
    String,
    ForeignKey,
    Text,
    TIMESTAMP,
    func,
    Boolean,
    Integer,
    Date,
    false,
    DateTime,
    true
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
        nullable=False,
        unique=True
    )

    user_id : Mapped[str] = mapped_column(      # 身份证号
        String(50),
        nullable=False,
        unique=True
    )

    user_hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_admin: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
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

    serial_number : Mapped[int] = mapped_column( # serial_number
        Integer,
        primary_key=True
    )

    uid : Mapped[int] = mapped_column( # uid
        ForeignKey("openaccount.users.uid"),
        nullable=False
    )

    ans_created_at : Mapped[datetime] = mapped_column( # ans_created_at
        TIMESTAMP,
        server_default=func.now()
    )

    p1 : Mapped[str] = mapped_column( # name
        Text,
        nullable=False
    )

    p2 : Mapped[str] = mapped_column( # idCardNumber
        Text,
        nullable=False
    )

    p3 : Mapped[str] = mapped_column( # idCardAddress
        Text,
        nullable=False
    )

    p4 : Mapped[date | None] = mapped_column( # idCardValidPeriodStart
        Date,
        nullable=True
    )

    p5 : Mapped[date | None] = mapped_column( # idCardValidPeriodEnd
        Date,
        nullable=True
    )

    p6 : Mapped[bool] = mapped_column( # ifIdCardPermanentlyValid
        Boolean,
        nullable=False
    )

    p7 : Mapped[str] = mapped_column( # contactAddressProvince
        Text,
        nullable=False
    )

    p8 : Mapped[str] = mapped_column( # contactAddressCity
        Text,
        nullable=False
    )

    p9 : Mapped[str] = mapped_column( # contactAddress
        Text,
        nullable=False
    )

    p10 : Mapped[str] = mapped_column( # contactAddressZipCode
        Text,
        nullable=False,
    )

    p11 : Mapped[str] = mapped_column( # departmentProvince
        Text,
        nullable=False,
        server_default="湖北省"
    )

    p12 : Mapped[str] = mapped_column( # departmentCity
        Text,
        nullable=False,
        server_default="武汉市"
    )

    p13 : Mapped[str] = mapped_column( # departmentCategory
        Text,
        nullable=False,
        server_default="0",
    )

    p14 : Mapped[str] = mapped_column( # departmentName
        Text,
        nullable=False,
        server_default="2015"
    )

    p15 : Mapped[str] = mapped_column( # contactnumber
        Text,
        nullable=False
    )

    p16 : Mapped[str] = mapped_column( # emailAddress
        Text,
        nullable=True
    )

    p17 : Mapped[str] = mapped_column( # occupation
        Text,
        nullable=False
    )

    p18 : Mapped[str] = mapped_column( # educationalQualification
        Text,
        nullable=False
    )

    p19 : Mapped[bool] = mapped_column( # ifIntermediary
        Boolean,
        nullable=False
    )

    p20 : Mapped[str] = mapped_column( # intermediaryName
        Text,
        nullable=True
    )

    p21 : Mapped[str] = mapped_column( # intermediaryCode
        Text,
        nullable=True
    )

    p22 : Mapped[str] = mapped_column( # referencePersonCode
        Text,
        nullable=True
    )

    p23 : Mapped[str] = mapped_column( # referencePersonName
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


class RefreshToken(Base) : 
    __tablename__ = "refreshtokens"
    __table_args__ = {"schema": "openaccount"}

    id : Mapped[int] = mapped_column(
        primary_key=True
    )

    hashed_token : Mapped[str] = mapped_column(
        Text,
        unique=True,
        nullable=False
    )

    uid: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "openaccount.users.uid",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    expire_at : Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=true(),
    )