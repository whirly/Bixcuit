import os, sys, site

current_dir = os.path.normpath( os.path.dirname(os.path.abspath(__file__)))
parent_dir = os.path.join(current_dir,'../')
site.addsitedir('/usr/local/lib/python2.7/site-packages')
sys.path.append(current_dir)
sys.path.append(parent_dir)
os.environ['DJANGO_SETTINGS_MODULE'] = 'bixcuit.settings'
import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()
