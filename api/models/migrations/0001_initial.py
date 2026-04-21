from tortoise import migrations
from tortoise.migrations import operations as ops
from models import CheckFieldEnum, CheckpointSuffixEnum
from tortoise.fields.base import OnDelete
from uuid import uuid4
from tortoise import fields

class Migration(migrations.Migration):
    initial = True

    operations = [
        ops.CreateModel(
            name='Plate',
            fields=[
                ('code', fields.CharField(primary_key=True, unique=True, db_index=True, max_length=32)),
                ('created_at', fields.DatetimeField(auto_now=False, auto_now_add=True)),
            ],
            options={'table': 'plate', 'app': 'models', 'pk_attr': 'code'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='PlateDailyUsage',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('plate', fields.ForeignKeyField('models.Plate', source_field='plate_id', db_constraint=True, to_field='code', related_name='daily_usage', on_delete=OnDelete.CASCADE)),
                ('date', fields.CharField(max_length=10)),
                ('count', fields.IntField(default=0)),
            ],
            options={'table': 'plate_daily_usage', 'app': 'models', 'unique_together': (('plate', 'date'),), 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='User',
            fields=[
                ('id', fields.UUIDField(primary_key=True, default=uuid4, unique=True, db_index=True)),
                ('email', fields.CharField(unique=True, max_length=254)),
                ('password_hash', fields.CharField(max_length=255)),
                ('is_admin', fields.BooleanField(default=False)),
                ('created_at', fields.DatetimeField(auto_now=False, auto_now_add=True)),
            ],
            options={'table': 'user', 'app': 'models', 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='PlateLock',
            fields=[
                ('plate', fields.OneToOneField('models.Plate', source_field='plate_id', primary_key=True, db_index=True, db_constraint=True, to_field='code', related_name='lock', on_delete=OnDelete.CASCADE)),
                ('holder', fields.ForeignKeyField('models.User', source_field='holder_id', db_constraint=True, to_field='id', related_name='plate_locks', on_delete=OnDelete.CASCADE)),
                ('ref_date', fields.CharField(max_length=10)),
                ('usage', fields.IntField(default=0)),
                ('acquired_at', fields.DatetimeField(auto_now=False, auto_now_add=True)),
            ],
            options={'table': 'plate_lock', 'app': 'models', 'pk_attr': 'plate_id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='SessionSubmission',
            fields=[
                ('id', fields.UUIDField(primary_key=True, default=uuid4, unique=True, db_index=True)),
                ('plate', fields.ForeignKeyField('models.Plate', source_field='plate_id', db_constraint=True, to_field='code', related_name='submissions', on_delete=OnDelete.CASCADE)),
                ('driver', fields.ForeignKeyField('models.User', source_field='driver_id', db_constraint=True, to_field='id', related_name='submissions', on_delete=OnDelete.CASCADE)),
                ('date', fields.CharField(max_length=10)),
                ('count', fields.IntField()),
                ('driver_name', fields.CharField(max_length=255)),
                ('mile', fields.CharField(max_length=32)),
                ('start_location', fields.CharField(default='', max_length=512)),
                ('alcohol', fields.BooleanField(default=False)),
                ('drug', fields.BooleanField(default=False)),
                ('created_at', fields.DatetimeField(auto_now=False, auto_now_add=True)),
            ],
            options={'table': 'session_submission', 'app': 'models', 'unique_together': (('plate', 'date', 'count'),), 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='SessionCheck',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('submission', fields.ForeignKeyField('models.SessionSubmission', source_field='submission_id', db_constraint=True, to_field='id', related_name='checks', on_delete=OnDelete.CASCADE)),
                ('field', fields.CharEnumField(description='law: law\ntax: tax\ninsurance: insurance\npassport: passport\nheadlight: headlight\nturnlight: turnlight\ntoplight: toplight\nlubeoil: lubeoil\ntankcoolant: tankcoolant\npercipitation: percipitation\nopsname: opsname\ndoormirror: doormirror\ntire: tire\ntirehub: tirehub\ntirehub2: tirehub2\ntirehub3: tirehub3\ntirehub4: tirehub4\nspare: spare\npressure: pressure\nextinguisher: extinguisher\ntiresupport: tiresupport\ncone: cone\nbreaklight: breaklight\nreverselight: reverselight\nbackturnlight: backturnlight\nstructuralintegrity: structuralintegrity\nfastener: fastener\ncover: cover', enum_type=CheckFieldEnum, max_length=32)),
                ('passed', fields.BooleanField(default=False)),
                ('note', fields.CharField(default='', max_length=512)),
                ('fix', fields.CharField(default='', max_length=512)),
            ],
            options={'table': 'session_check', 'app': 'models', 'unique_together': (('submission', 'field'),), 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='SessionCheckpoint',
            fields=[
                ('id', fields.IntField(generated=True, primary_key=True, unique=True, db_index=True)),
                ('submission', fields.ForeignKeyField('models.SessionSubmission', source_field='submission_id', db_constraint=True, to_field='id', related_name='checkpoints', on_delete=OnDelete.CASCADE)),
                ('suffix', fields.CharEnumField(description='rest1: rest1\nrest2: rest2\ndestination: destination\npassRest1: passRest1\npassRest2: passRest2\npassDestination: passDestination\nend: end', enum_type=CheckpointSuffixEnum, max_length=20)),
                ('time', fields.CharField(max_length=32)),
                ('location', fields.CharField(null=True, max_length=512)),
            ],
            options={'table': 'session_checkpoint', 'app': 'models', 'unique_together': (('submission', 'suffix'),), 'pk_attr': 'id'},
            bases=['Model'],
        ),
        ops.CreateModel(
            name='WorkingSession',
            fields=[
                ('user', fields.OneToOneField('models.User', source_field='user_id', primary_key=True, db_index=True, db_constraint=True, to_field='id', related_name='working_session', on_delete=OnDelete.CASCADE)),
                ('plate', fields.CharField(max_length=32)),
                ('working', fields.BooleanField(default=True)),
                ('rest1', fields.BooleanField(default=False)),
                ('rest2', fields.BooleanField(default=False)),
                ('destination', fields.BooleanField(default=False)),
                ('pass_rest1', fields.BooleanField(default=False)),
                ('pass_rest2', fields.BooleanField(default=False)),
                ('pass_destination', fields.BooleanField(default=False)),
                ('updated_at', fields.DatetimeField(auto_now=True, auto_now_add=False)),
            ],
            options={'table': 'working_session', 'app': 'models', 'pk_attr': 'user_id'},
            bases=['Model'],
        ),
    ]
