from django.shortcuts import render

def home(request):
    return render(request, 'hello.html')

def barchart(request):
    return render(request, 'bar.html')

def piechart(request):
    return render(request, 'pie.html')


def forcechart(request):
    return render(request, 'force.html')

def geomap(request):
    return render(request, 'geomap.html')
