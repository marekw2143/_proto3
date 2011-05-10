from django.db.models import Model, ForeignKey, IntegerField, DateTimeField, TextField, CharField, BooleanField, ManyToManyField
from django.contrib.auth.models import User
from django.contrib import admin
import datetime

from django.db.models import Max
def getMaxRev(diagram_id):
	diagram_id = int(diagram_id)#TODO: use it below in filter condition
	ret = Serialized.objects.filter(diagram__id = diagram_id).aggregate(Max('rev'))['rev__max']
	if not ret: ret = 0
	return ret

# Create your models here.
class Project(Model):
	name = CharField(max_length = 100)
	description = TextField()
	creator = ForeignKey(User, related_name = 'created_projects')
	allowed_users = ManyToManyField(User)

	def get_absolute_url(self):
		return '/project/%i/' % self.id
	def __str__(self):
		return 'Creator: %s, id: %i, name: %s, description: %s' % (self.creator, int(self.id), self.name, self.description)

class DiagramType(Model):
	name = CharField(max_length = 30)
	def __str__(self):
		return str(self.name)

class BaseObject(Model):
	date = DateTimeField(blank = True, null = True)
	active = BooleanField(default = True)
	class Meta:
		abstract = True
	def save(self, *args, **kwargs):
		self.date = datetime.datetime.now()
		super(BaseObject, self).save(*args, **kwargs)

class Diagram(BaseObject):
	project = ForeignKey('Project')
	creator = ForeignKey(User, related_name = 'diagrams')
	type = ForeignKey('DiagramType', blank = True, null = True)
	description = TextField()

	allowed_users = ManyToManyField(User)
	public = BooleanField(default = False, verbose_name = 'visible to all users in the internet')

	def maxRev(self): 
		return getMaxRev(self.id)
	def get_absolute_url(self):
		return '/diagram/%i/' % self.id
	def save(self, *args, **kwargs):
		first_time = False
		if not self.id:	first_time = True

		super(Diagram, self).save(*args, **kwargs)

		if first_time:
			serialized = Serialized(diagram = self, rev = 0, user = self.creator, data ='')
			serialized.save()

	def __str__(self):
		return 'id: %i, description: %s, type: %s'%(self.id, str(self.description),  str(self.type))


class Serialized(BaseObject):
	diagram = ForeignKey('Diagram')
	rev = IntegerField()
	data = TextField()
	user = ForeignKey(User, blank = True, null = True)
	def __str__(self):
		return 'diagram: %s, rev: %s' %(str(self.diagram), str(self.rev))
		

