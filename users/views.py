# Create your views here.
from models import *
from django.views.generic.simple import direct_to_template
from django.shortcuts import redirect, get_object_or_404
from django.conf import settings
from pdb import set_trace

# set proper template name according to deployment mode
view_template_name = 'view.html'
if settings.PROD:
	view_template_name = 'prod_view.html'

def unauthorized(request = None, message = None): return redirect('/unauthorized/')

def open_diagram(request, diagram_id = None, revision_id = None, read_only = False, template_name = view_template_name):
	u'returns data about diagram'
	diagram = get_object_or_404(Diagram, id = diagram_id)
	user = request.user

	# authorize below
	if diagram.public == True: pass
	elif user == diagram.creator: pass
	#elif user in diagram.allowed_users.all(): pass
	else: return unauthorized();


	if not revision_id: revision_id = diagram.maxRev()
	load = 'true' #load = 'false' if revision_id == 0 else 'true'
	if revision_id == 0: load = 'false'
	read_only = 'false' if not read_only else 'true'

	# get diagram data
	serialized = Serialized.objects.get(rev = revision_id, diagram = diagram)

	return direct_to_template(request, template_name, {'serialized': serialized, 'load': load, 'read_only': read_only, 'diagram': diagram})


# code below is a bit tricky - demo_user must exist and must create a diagram of each type
def create_demo_instance(type_id):
	ret = Diagram.objects.filter(creator = User.objects.get(username = 'demo_user'))
	ret = ret.filter(type__id = type_id)
	return ret[0]


def demo(request, diagram_type_id = 1, template_name = view_template_name):
	u'opens diagram of given type'
	global create_demo_instance
	def demo_diagrams(type_id):
		return create_demo_instance(type_id)

	diagram = demo_diagrams(int(diagram_type_id))
	revision_id = getMaxRev(diagram.id)
	serialized = Serialized.objects.get(rev = revision_id, diagram = diagram)
	return direct_to_template(request, template_name, {'serialized': serialized, 'load': 'true', 'read_only': 'true', 'diagram': diagram})
		

		
from models import Project, Serialized, Diagram
def save_view(request, template_name = view_template_name):
	u'saves the diagram'
	if request.method == 'POST':
		post = request.POST
		data = post['serialized']#serialized data of the diagram
		project_id = post['project_id']#project id
		diagram_id = post['diagram_id']#diagram id
		diagram = get_object_or_404(Diagram, id = diagram_id)

		# can't save demo diagram
		if request.user != User.objects.get(username = 'demo_user'):
			if diagram.creator == User.objects.get(username = 'demo_user'): return unauthorized()

		# authorization here - only diagram creator can save
		if request.user != diagram.creator: return unauthorized()

		rev = getMaxRev(diagram_id) + 1 #get number of the revision of the newly saved diagram
		
		# save the diagram
		serialized = Serialized(diagram = diagram, data = data, rev = rev, user = request.user)
		serialized.save()

		# redirect to project_view page
		return diagram_list(request, project_id)


from django.views.generic.list_detail import object_list
from django.views.generic.create_update import create_object, update_object
from forms import DiagramForm, EditDiagramForm, ProjectCreateForm
def create_project(request):
	context = {}
	if request.method == 'POST':
		form = ProjectCreateForm(request.POST)
		if form.is_valid():
			project = form.save(commit = False)
			project.creator = request.user
			project.save()
			project.allowed_users.add(request.user)
			return redirect('/projects/')
		else: context['form'] = form
	return create_object(request, form_class = ProjectCreateForm, extra_context = context)

def add_diagram(request, project_id):
	u'list of available diagram types,  project to which to add the diagram'
	return object_list(request, DiagramType.objects.all(), extra_context = { 'project': get_object_or_404(Project, id=project_id)})

def create_diagram(request, type_id, project_id, template_name = 'users/create_diagram_form.html'):
	context = {}
	if request.method == 'POST':
		project = get_object_or_404(Project, id=project_id)
		type = get_object_or_404(DiagramType, id=type_id)
		user = request.user

		# authorization
		if user != project.creator: return unauthorized()

		form = DiagramForm(request.POST)
		if form.is_valid():
			diagram = form.save(commit = False)
			diagram.project = project
			diagram.creator = user
			diagram.type = type
			diagram.save()
			diagram.allowed_users.add(user)
			return redirect('/project/%i/' % diagram.project.id)
		else: context['form'] = form
	return create_object(request, form_class = DiagramForm, extra_context = context)

def project_list(request):
	u'returns list of all projects that the user has access to'
	return object_list(request, Project.objects.filter(allowed_users = request.user) )

def diagram_list(request, project_id = None):
	u'returns list of all diagrams for given project'
	project = get_object_or_404(Project, id = project_id)
	user = request.user

	# authorization
	if user in project.allowed_users.all(): pass
	elif user == project.creator: pass
	else: return unauthorized(message = 'you have no privileges to explore that project')

	return object_list(request, Diagram.objects.filter(project = project), extra_context ={'project': project})


def edit_diagram(request, id=0):
	diagram = get_object_or_404(Diagram, id = id)
	
	# authorization
	if diagram.creator != request.user: return unauthorized(message = 'you\'re not authorized to edit data of that diagram')

	return update_object(request, form_class = EditDiagramForm, object_id = diagram.id, post_save_redirect = '/project/%i/' % diagram.project.id)


from django.contrib.auth.models import User
def add_user_to_diagram(request):
	u'assign concrete user to concrete diagram, all params specified in POST'
	if request.method == 'POST':
		post = request.POST
		user_id = POST['user_id']
		diagram_id = POST['diagram_id']
		
		diagram = get_object_or_404(Diagram, id = diagram_id)

		# authorization
		if request.user != diagram.creator: return unauthorized()

		# add user if he hasn't been added yet
		added_user = get_object_or_404(User, id = user_id)
		if added_user not in diagram.allowed_users.all():
			diagram.allowed_users.add(added_user)

def get_user_by_email(request, type, id, template_name = 'abc.html'):
	u'''type: 0 - getting user for project
		1 - getting user for diagram
		id - id of the artefact (project or diagram'''
	model_class = None
	if type == 'project':pass
	project = get_object_or_404(Project, id)
	
	# authorization
	if request.user != project.creator: return unauthorized()

	if request.method == 'POST':
		email = request.POST['email']
		user = User.objects.get(email = email)
		return direct_to_template(request, template_name, {'added_user': user, 'type': type, 'id': id})
