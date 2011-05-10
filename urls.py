from django.conf.urls.defaults import *

from django.views.generic.simple import direct_to_template
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	(r'^', include('marekw2143_registration.urls')),

#	(r'^forum/',include('djangobb_forum.urls', namespace='djangobb')),
#	(r'^admin/(.*)', admin.site.root),
)

# todo: cache demo
urlpatterns += patterns('users.views',
	(r'^editdiagram/(?P<id>\d{1,10})/$', 'edit_diagram'),
	(r'^diagram/(?P<diagram_id>\d{1,10})/$', 'open_diagram'),#opens given diagram

	(r'^add_diagram/(?P<project_id>\d{1,10})/$', 'add_diagram'),#shows data to choose diagram type
	(r'^create_diagram/(?P<project_id>\d{1,10})/(?P<type_id>\d{1})/$', 'create_diagram'),#creates a diagram of concrete type

	(r'^create_project/$', 'create_project'),#creates new project

	(r'^save_view/$', 'save_view'),#saves the diagram, then redirects to project_view pagee
	(r'^projects/$', 'project_list'),#lists all projects
	(r'^project/(?P<project_id>\d{1,10})/$', 'diagram_list'),#lists all diagrams in project
	(r'^demo/(?P<diagram_type_id>\d{1,10})/$', 'demo'),#launch demo diagram
)

# TODO: cache demo_choose_type
from users.models import DiagramType
urlpatterns += patterns('django.views.generic.simple',
	(r'^unauthorized/$','direct_to_template', {'template': 'unauthorized.html'}),
	(r'^demo_choose_type/$', 'direct_to_template', {'template': 'demo_choose_type.html', 
			'extra_context': {'types': DiagramType.objects.all()}
		}),
)


urlpatterns += patterns('',
	(r'^i18n/', include('django.conf.urls.i18n')),
	
	(r'^accounts/register/$', 'users.login.register'),
	(r'^accounts/', include('registration.backends.default.urls')),
	(r'^register/', 'users.login.register'),

	(r'^admin/', include(admin.site.urls)),
	(r'^captcha/', include('captcha.urls')),
)

from django.conf import settings
if not settings.PROD:
	urlpatterns += patterns('',
		(r'^site_media/(?P<path>.*)$', 'django.views.static.serve',
		{'document_root': settings.MEDIA_ROOT}),
	)


