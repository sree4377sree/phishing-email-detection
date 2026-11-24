
from django.db.models import  Count, Avg
from django.shortcuts import render, redirect
from django.conf import settings
import os
from django.db.models import Count
from django.db.models import Q
import datetime
import xlwt
from django.http import HttpResponse
import numpy as np

import pandas as pd

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.metrics import accuracy_score

# Create your views here.
from Remote_User.models import ClientRegister_Model,detect_phishing_email,detection_accuracy,detection_ratio


def serviceproviderlogin(request):
    error = None
    if request.method == "POST":
        admin = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()

        if admin.lower() == "admin" and password.lower() == "admin":
            request.session['admin'] = 'Admin'
            detection_accuracy.objects.all().delete()
            return redirect('View_Remote_Users')
        else:
            error = "Invalid administrator credentials."

    return render(request, 'SProvider/serviceproviderlogin.html', {'error': error})

def View_Detected_Email_Phishing_Detection_Status_Ratio(request):
    detection_ratio.objects.all().delete()
    ratio = ""
    kword = 'Non-Phishing'
    print(kword)
    obj = detect_phishing_email.objects.all().filter(Q(Prediction=kword))
    obj1 = detect_phishing_email.objects.all()
    count = obj.count();
    count1 = obj1.count();
    ratio = (count / count1) * 100 if count1 else 0
    if ratio != 0:
        detection_ratio.objects.create(names=kword, ratio=ratio)

    ratio1 = ""
    kword1 = 'Phishing'
    print(kword1)
    obj1 = detect_phishing_email.objects.all().filter(Q(Prediction=kword1))
    obj11 = detect_phishing_email.objects.all()
    count1 = obj1.count();
    count11 = obj11.count();
    ratio1 = (count1 / count11) * 100 if count11 else 0
    if ratio1 != 0:
        detection_ratio.objects.create(names=kword1, ratio=ratio1)



    obj = detection_ratio.objects.all()
    return render(request, 'SProvider/View_Detected_Email_Phishing_Detection_Status_Ratio.html', {'objs': obj})

def View_Remote_Users(request):
    obj=ClientRegister_Model.objects.all()
    return render(request,'SProvider/View_Remote_Users.html',{'objects':obj})

def ViewTrendings(request):
    topic = detect_phishing_email.objects.values('topics').annotate(dcount=Count('topics')).order_by('-dcount')
    return  render(request,'SProvider/ViewTrendings.html',{'objects':topic})

def charts(request,chart_type):
    chart1 = detection_ratio.objects.values('names').annotate(dcount=Avg('ratio'))
    return render(request,"SProvider/charts.html", {'form':chart1, 'chart_type':chart_type})

def charts1(request,chart_type):
    chart1 = detection_accuracy.objects.values('names').annotate(dcount=Avg('ratio'))
    return render(request,"SProvider/charts1.html", {'form':chart1, 'chart_type':chart_type})

def View_Detected_Email_Phishing_Detection_Status_Type(request):
    obj =detect_phishing_email.objects.all()
    return render(request, 'SProvider/View_Detected_Email_Phishing_Detection_Status_Type.html', {'list_objects': obj})

def likeschart(request,like_chart):
    charts =detection_accuracy.objects.values('names').annotate(dcount=Avg('ratio'))
    return render(request,"SProvider/likeschart.html", {'form':charts, 'like_chart':like_chart})


def Download_Predicted_DataSets(request):

    response = HttpResponse(content_type='application/ms-excel')
    # decide file name
    response['Content-Disposition'] = 'attachment; filename="Predicted_Data.xls"'
    # creating workbook
    wb = xlwt.Workbook(encoding='utf-8')
    # adding sheet
    ws = wb.add_sheet("sheet1")
    # Sheet header, first row
    row_num = 0
    font_style = xlwt.XFStyle()
    # headers are bold
    font_style.font.bold = True
    # writer = csv.writer(response)
    obj = detect_phishing_email.objects.all()
    data = obj  # dummy method to fetch data.
    for my_row in data:
        row_num = row_num + 1
        ws.write(row_num, 0, my_row.sender, font_style)
        ws.write(row_num, 1, my_row.receiver, font_style)
        ws.write(row_num, 2, my_row.edate, font_style)
        ws.write(row_num, 3, my_row.subject, font_style)
        ws.write(row_num, 4, my_row.body, font_style)
        ws.write(row_num, 5, my_row.Prediction, font_style)

    wb.save(response)
    return response

def train_model(request):
    detection_accuracy.objects.all().delete()

    from ai_engine.train import run_training
    metrics_payload = run_training()

    comparisons = metrics_payload.get("model_comparisons", [])
    for comp in comparisons:
        detection_accuracy.objects.create(
            names=comp["model_name"],
            ratio=str(comp["accuracy"])
        )

    obj = detection_accuracy.objects.all()
    return render(request, 'SProvider/train_model.html', {
        'objs': obj,
        'metrics': metrics_payload
    })