from django.shortcuts import render

def home(request):
    return render(request, 'spa.html')

def home_layout(request):
    return render(request, 'layout.html')
