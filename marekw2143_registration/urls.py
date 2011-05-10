from django.conf.urls.defaults import *

urlpatterns = patterns('',
#	(r'^/$', 'custom_registration.views.login_view'),
#	(r'^login/$', 'custom_registration.views.login_view'), 

	(r'^logout/$', 'django.contrib.auth.views.logout', {'next_page' : '/login/' } ),

	# resetting password
	url(r'^admin/password_reset/$', 'django.contrib.auth.views.password_reset', name='password_reset'),
	(r'^password_reset/done/$', 'django.contrib.auth.views.password_reset_done'),
	(r'^reset/()/$', 'django.contrib.auth.views.password_reset_confirm'),
	(r'^reset/done/$', 'django.contrib.auth.views.password_reset_complete'),


	# registration
	(r'^accounts/register/$', 'marekw2143_registration.views.register'),
	(r'^accounts/', include('registration.backends.default.urls')),
	(r'^register/', 'marekw2143_registration.views.register'),   

)

urlpatterns += patterns('django.contrib.auth.views',
	(r'^$', 'login'),
	(r'^login$', 'login'),
	(r'^login/$', 'login'),
	(r'^logout/$', 'logout', {'next_page' : '/login/' } ),
)

