# Create your views here.
import urllib2
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template import RequestContext


def home(request):
    context = RequestContext(request)
    return render_to_response("home.html", {"where": "home"}, context_instance=context)


def get_stations(request):
    response = urllib2.urlopen('http://montreal.bixi.com/data/bikeStations.xml')
    xml = response.read()

    return HttpResponse(xml)
