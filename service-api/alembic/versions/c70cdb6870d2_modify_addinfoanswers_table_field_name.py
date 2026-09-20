"""modify addinfoanswers table field name

Revision ID: c70cdb6870d2
Revises: 59ea6d4c3475
Create Date: 2026-09-20 13:38:48.879645

"""
from typing import Sequence, Union
from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'c70cdb6870d2'
down_revision: Union[str, Sequence[str], None] = '59ea6d4c3475'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


COLUMN_RENAMES = (
    ("name", "p1"),
    ("idCardNumber", "p2"),
    ("idCardAddress", "p3"),
    ("idCardValidPeriodStart", "p4"),
    ("idCardValidPeriodEnd", "p5"),
    ("ifIdCardPermanentlyValid", "p6"),
    ("contactAddressProvince", "p7"),
    ("contactAddressCity", "p8"),
    ("contactAddress", "p9"),
    ("postalCode", "p10"),
    ("departmentProvince", "p11"),
    ("departmentCity", "p12"),
    ("departmentCategory", "p13"),
    ("departmentName", "p14"),
    ("contactnumber", "p15"),
    ("emailAddress", "p16"),
    ("occupation", "p17"),
    ("educationalQualification", "p18"),
    ("ifIntermediary", "p19"),
    ("intermediaryName", "p20"),
    ("intermediaryCode", "p21"),
    ("referencePersonCode", "p22"),
    ("referencePersonName", "p23"),
)


def upgrade() -> None:
    """Upgrade schema."""
    for old_name, new_name in COLUMN_RENAMES:
        op.alter_column(
            "addinfoanswers",
            old_name,
            new_column_name=new_name,
            schema="openaccount"
        )


def downgrade() -> None:
    """Downgrade schema."""
    for old_name, new_name in reversed(COLUMN_RENAMES):
        op.alter_column(
            "addinfoanswers",
            new_name,
            new_column_name=old_name,
            schema="openaccount"
        )
