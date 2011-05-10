#:Django settings for back project.
import os.path
import sys
import re

PROD = False
DEBUG = not PROD
TEMPLATE_DEBUG = DEBUG

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))


ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)
MANAGERS = ADMINS


#
# email settings
#
EMAIL_HOST = None
EMAIL_HOST_USER = None
EMAIL_HOST_PASSWORD = None
DEFAULT_FROM_EMAIL = None
EMAIL_PORT = 1025
EMAIL_USE_TLS = False

if PROD:
	EMAIL_HOST = 'marekw2143.megiteam.pl'
	EMAIL_HOST_USER = 'administrator@diagramsonline.com'
	EMAIL_HOST_PASSWORD = 'sv8cbx'
	DEFAULT_FROM_EMAIL = 'administrator@diagramsonline.com'
	EMAIL_PORT = 25
	EMAIL_USE_TLS = True




DATABASE_ENGINE = 'sqlite3'#'postgresql_psycopg2'
DATABASE_NAME = 'db_file_sqlite3'
DATABASE_USER = 'postgres'
DATABASE_PASSWORD = 'a'
DATABASE_HOST = ''
DATABASE_PORT = '5433'
if PROD:
	DATABASE_ENGINE = 'postgresql_psycopg2'
	DATABASE_NAME = 'pg_2524'
	DATABASE_USER = 'pg_2524u'
	DATABASE_PASSWORD = 'a'
	DATABASE_HOST = 'sql.marekw2143.megiteam.pl'
	DATABASE_PORT = '5435'


LOGIN_URL = '/login/'
LOGIN_REDIRECT_URL = '/projects/'

TIME_ZONE = 'America/Chicago'

LANGUAGE_CODE = 'en-us'

SITE_ID = 1

USE_I18N = False

MEDIA_ROOT = os.path.join(PROJECT_ROOT, 'site_media')
if not PROD: MEDIA_ROOT = os.path.join(PROJECT_ROOT, '_site_media')

MEDIA_URL = '/site_media/'

ADMIN_MEDIA_PREFIX = '/media/'


SECRET_KEY = 'srqly3i5u1ij!zbi-%@((9&uvve^_d+nc9at51^e_@_3u9-1u!'

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
)

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.core.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.request',
#    'django_authopenid.context_processors.authopenid',
#    'djangobb_forum.context_processors.forum_settings'
)

DJAPIAN_DATABASE_PATH = os.path.join(PROJECT_ROOT, 'djapian_db')

MIDDLEWARE_CLASSES = (
	'django.middleware.cache.UpdateCacheMiddleware',
	'django.middleware.common.CommonMiddleware',
	'django.contrib.sessions.middleware.SessionMiddleware',
	'django.middleware.locale.LocaleMiddleware',
	'django.contrib.auth.middleware.AuthenticationMiddleware',
	'django.contrib.csrf.middleware.CsrfMiddleware',
#	'django_authopenid.middleware.OpenIDMiddleware',
	'django.middleware.cache.FetchFromCacheMiddleware',
#	'djangobb_forum.middleware.LastLoginMiddleware',
#	'djangobb_forum.middleware.UsersOnline',
)


ROOT_URLCONF = 'urls'

TEMPLATE_DIRS = (
	os.path.join(PROJECT_ROOT, 'templates'),
)

CACHE_MIDDLEWARE_ANONYMOUS_ONLY = True

ACCOUNT_ACTIVATION_DAYS = 2

INSTALLED_APPS = (
	'django.contrib.auth',
	'django.contrib.contenttypes',
	'django.contrib.sessions',
	'django.contrib.sites',
	'django.contrib.sitemaps',
	'django.contrib.admin',
	'django.contrib.admindocs',
	'registration',
#	'django_authopenid',
#	'djangobb_forum',
#	'djapian',
	'captcha',

	#managing diagrams
	'users',
)
