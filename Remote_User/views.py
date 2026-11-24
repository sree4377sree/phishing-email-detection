from django.db.models import Count
from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
import os
import datetime
import openpyxl


import pandas as pd

from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from sklearn.metrics import accuracy_score

from sklearn.ensemble import VotingClassifier
# Create your views here.
from Remote_User.models import ClientRegister_Model,detect_phishing_email,detection_accuracy,detection_ratio

def login(request):
    error = None
    if request.method == "POST":
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '').strip()

        if not username or not password:
            error = "Please enter both username and password."
        else:
            try:
                enter = ClientRegister_Model.objects.get(username__iexact=username, password=password)
                request.session["userid"] = enter.id
                return redirect('ViewYourProfile')
            except ClientRegister_Model.DoesNotExist:
                error = "Invalid username or password."
            except Exception as e:
                error = f"Login error: {str(e)}"

    return render(request, 'RUser/login.html', {'error': error})

def Add_DataSet_Details(request):

    return render(request, 'RUser/Add_DataSet_Details.html', {"excel_data": ''})


def Register1(request):
    error = None
    obj = None
    if request.method == "POST":
        username = request.POST.get('username', '').strip()
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()
        phoneno = request.POST.get('phoneno', '').strip()
        country = request.POST.get('country', '').strip()
        state = request.POST.get('state', '').strip()
        city = request.POST.get('city', '').strip()
        address = request.POST.get('address', '').strip()
        gender = request.POST.get('gender', '').strip()

        if not username or not password or not email:
            error = "Username, email, and password are required fields."
        elif ClientRegister_Model.objects.filter(username__iexact=username).exists():
            error = "A user with this username already exists. Please choose a different username."
        else:
            user = ClientRegister_Model.objects.create(
                username=username,
                email=email,
                password=password[:10],
                phoneno=phoneno[:10] if phoneno else "N/A",
                country=country or "N/A",
                state=state or "N/A",
                city=city or "N/A",
                address=address or "N/A",
                gender=gender or "N/A"
            )
            request.session["userid"] = user.id
            return redirect('ViewYourProfile')

    return render(request, 'RUser/Register1.html', {'error': error, 'object': obj})

def ViewYourProfile(request):
    userid = request.session.get('userid')
    if not userid:
        return redirect('login')
    try:
        obj = ClientRegister_Model.objects.get(id=userid)
    except ClientRegister_Model.DoesNotExist:
        return redirect('login')
    return render(request,'RUser/ViewYourProfile.html',{'object':obj})


def Detect_Email_Phishing_Detection_Status(request):
    if request.method == "POST":

        sender = request.POST.get('sender', '')
        receiver = request.POST.get('receiver', '')
        edate = request.POST.get('edate', '')
        subject = request.POST.get('subject', '')
        body = request.POST.get('body', '')

        from ai_engine.predict import predict_email

        ai_result = predict_email(
            sender=sender or "",
            receiver=receiver or "",
            subject=subject or "",
            body=body or ""
        )

        val = ai_result["prediction"]

        detect_phishing_email.objects.create(
            sender=sender,
            receiver=receiver,
            edate=edate,
            subject=subject,
            body=body,
            Prediction=val
        )

        return render(request, 'RUser/Detect_Email_Phishing_Detection_Status.html', {
            'objs': val,
            'result': ai_result,
        })
    return render(request, 'RUser/Detect_Email_Phishing_Detection_Status.html')



