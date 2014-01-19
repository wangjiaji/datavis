from django.shortcuts import render

def home(request):
    return render(request, 'hello.html')

def barchart(request):
    return render(request, 'bar.html')

def piechart(request):
    return render(request, 'pie.html')
