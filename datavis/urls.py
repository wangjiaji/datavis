from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'datavis.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^$', 'home.views.home', name='home'),
    url(r'bar/$', 'home.views.barchart'),
    url(r'pie/$', 'home.views.piechart'),
    url(r'force/$', 'home.views.forcechart'),
    url(r'map/$', 'home.views.geomap'),

    url(r'spa/$', 'spa.views.home'),
    url(r'^admin/', include(admin.site.urls)),
)
