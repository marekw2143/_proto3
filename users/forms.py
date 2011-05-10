from django.forms import ModelForm
from models import Diagram, Project

class ProjectCreateForm(ModelForm):
	class Meta:
		model = Project
		fields = ('name', 'description')
	
class DiagramForm(ModelForm):
	class Meta:
		model = Diagram
		fields = ('description',)

class EditDiagramForm(ModelForm):
	class Meta:
		model = Diagram
		fields = ('description', 'public')
