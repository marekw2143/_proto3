# -*- coding: utf-8 -*-

from registration.forms import RegistrationFormUniqueEmail as django_registration_RegistrationForm
from captcha.fields import CaptchaField
			
class RegistrationForm(django_registration_RegistrationForm):
	captcha = CaptchaField()
	
from registration.views import register as django_register
def register(request):
	return django_register(request, backend = 'registration.backends.default.DefaultBackend', form_class = RegistrationForm)
	

