from tortoise import migrations
from tortoise.migrations import operations as ops

class Migration(migrations.Migration):
    dependencies = [('models', '0001_initial')]

    initial = False

    operations = [
        ops.AlterModelOptions(
            name='PlateLock',
            options={'table': 'plate_lock', 'app': 'models', 'pk_attr': 'plate_id'},
        ),
        ops.AlterModelOptions(
            name='WorkingSession',
            options={'table': 'working_session', 'app': 'models', 'pk_attr': 'user_id'},
        ),
    ]
