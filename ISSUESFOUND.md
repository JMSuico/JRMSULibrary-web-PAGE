Perform fixing and Implement not by forcely work it in one work make it phase by phase...



first Phase:

double check where is the JWT being implemented

double check if the password using hashing in the management command for admin and password is using hashing

add also function in the user management and python management command (python manage.py createsuperuser, python manage.py createsuperuser_custom) for hashing password with requirement 10 characters Atleast 1 uppercase A-Z, 1 lowercase a-z, 1 special character (!@#$%^&*), and 1-0 number

then double check if the email and rizal assistant using Encrytion for messages





second Phase (issues found):

issues found for responsiveness for any devices

see the 1st picture in the admin panel Newly Acquired Books -> button "New Batch" -> doesn't display organize during responsive


third Phase:
issues found for Blurry overlay display
in the admin panel E-Resources -> in the upload file to cba see the 2nd picture the blurry during floating modal card overlay does not cover all the page fix it



fourth Phase:
issues found in the Page Text Content
in the admin panel Content manager in the page text context -> all the text that have function to edit couldn't edit at all files it perform deep searching for issues and fix it 

backend results:
Method Not Allowed: /api/content/about_history/
[08/Jul/2026 08:39:07] "PATCH /api/content/about_history/ HTTP/1.1" 405 42
Method Not Allowed: /api/content/about_history/
[08/Jul/2026 08:39:08] "PATCH /api/content/about_history/ HTTP/1.1" 405 42
Method Not Allowed: /api/content/about_history/
[08/Jul/2026 08:39:18] "PATCH /api/content/about_history/ HTTP/1.1" 405 42
Method Not Allowed: /api/content/about_history/
[08/Jul/2026 08:39:19] "PATCH /api/content/about_history/ HTTP/1.1" 405 42
[08/Jul/2026 08:39:19] "GET /api/notifications/all/ HTTP/1.1" 200 703



fifth Phase:
issues found in the Downloadable files
in the admin panel Content manager in the Downloadable Files -> the upload files does not function it cant upload file to display in the nav Administration in the Manual (Manual & Policies) -> Change the name/Rename the Downloadable files to Manual files

backend results:
[08/Jul/2026 08:43:19] "GET /api/notifications/all/ HTTP/1.1" 200 703
Bad Request: /api/managed-files/
[08/Jul/2026 08:43:28] "POST /api/managed-files/ HTTP/1.1" 400 75
Bad Request: /api/managed-files/
[08/Jul/2026 08:43:29] "POST /api/managed-files/ HTTP/1.1" 400 75
Bad Request: /api/managed-files/
[08/Jul/2026 08:43:41] "POST /api/managed-files/ HTTP/1.1" 400 75



sixth Phase:
issues found in the admin panel - E-Resources
uploading files in the tree view is function but the remove function to move to recycle result in errors and issues fix it

backend results:
[08/Jul/2026 08:48:02] "GET /api/eresource-departments/ HTTP/1.1" 200 106450
Internal Server Error: /api/eresource-files/1162/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 197, in _get_response
    response = wrapped_callback(request, *callback_args, **callback_kwargs)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\views\decorators\csrf.py", line 56, in wrapper_view
    return view_func(*args, **kwargs)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\rest_framework\viewsets.py", line 125, in view
    return self.dispatch(request, *args, **kwargs)
           ~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\rest_framework\views.py", line 515, in dispatch
    response = self.handle_exception(exc)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\rest_framework\views.py", line 475, in handle_exception
    self.raise_uncaught_exception(exc)
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\rest_framework\views.py", line 486, in raise_uncaught_exception
    raise exc
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\rest_framework\views.py", line 512, in dispatch
    response = handler(request, *args, **kwargs)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\Features\Api\Controllers\cms_controller.py", line 205, in destroy
    item = self.service.repository.get_by_id(pk)
           ^^^^^^^^^^^^^^^^^^^^^^^
AttributeError: 'EResourceFileService' object has no attribute 'repository'
[08/Jul/2026 08:48:12] "DELETE /api/eresource-files/1162/ HTTP/1.1" 500 105876
[08/Jul/2026 08:48:12] "GET /api/eresource-departments/ HTTP/1.1" 200 106450
[08/Jul/2026 08:48:15] "GET /api/eresource-departments/ HTTP/1.1" 200 106450



seventh Phase:
issues found in the admin panel settings 
in the Archive batches in the settings during responsiveness for any devices the table in archives is being clip fix it see the 3rd picture





eighth Phase:
issues found in the admin Panel User management
naturally if the admin user who login its account and he try to suspend its own account it will not suspend it will be forbidden add function to pale color or untouchable the suspend button to the admin user who login its account he try to suspend it.

another issues found connected to the admin Panel User management
if the admin try to suspend the account of the other user admin this shows (the account couldn't suspend) fix it 

backend results:
Forbidden: /api/users/2/
[08/Jul/2026 08:56:11] "PATCH /api/users/2/ HTTP/1.1" 403 58




ninth Phase:
major issues found
after the another issues found connected to the admin Panel User management

the server is shutdown add function for optimization

backend results:
[08/Jul/2026 08:56:30] "GET /api/notifications/all/ HTTP/1.1" 403 58
Forbidden: /api/notifications/all/
[08/Jul/2026 08:57:29] "GET /api/notifications/all/ HTTP/1.1" 403 58
Forbidden: /api/notifications/all/
[08/Jul/2026 08:58:30] "GET /api/notifications/all/ HTTP/1.1" 403 58
Forbidden: /api/notifications/all/
[08/Jul/2026 08:59:29] "GET /api/notifications/all/ HTTP/1.1" 403 58
Forbidden: /api/users/
[08/Jul/2026 08:59:58] "GET /api/users/ HTTP/1.1" 403 58
Forbidden: /api/reports/history/
[08/Jul/2026 08:59:59] "GET /api/reports/history/?search=&limit=5&offset=0 HTTP/1.1" 403 58
Forbidden: /api/reports/history/
[08/Jul/2026 08:59:59] "GET /api/reports/history/?search=&limit=5&offset=0 HTTP/1.1" 403 58
Forbidden: /api/reports/summary/
[08/Jul/2026 08:59:59] "GET /api/reports/summary/?type=summary&dateRange=this-month HTTP/1.1" 403 58
Forbidden: /api/reports/summary/
[08/Jul/2026 08:59:59] "GET /api/reports/summary/?type=summary&dateRange=this-month HTTP/1.1" 403 58
Forbidden: /api/reports/history/
[08/Jul/2026 09:00:18] "GET /api/reports/history/?search=&limit=5&offset=0 HTTP/1.1" 403 58
Forbidden: /api/reports/history/
[08/Jul/2026 09:00:18] "GET /api/reports/history/?search=&limit=5&offset=0 HTTP/1.1" 403 58
Forbidden: /api/notifications/all/
[08/Jul/2026 09:00:29] "GET /api/notifications/all/ HTTP/1.1" 403 58
[08/Jul/2026 09:01:16] "GET /api/settings/ HTTP/1.1" 200 345
[08/Jul/2026 09:01:16] "GET /api/settings/ HTTP/1.1" 200 345
Forbidden: /api/recycle-bin/
[08/Jul/2026 09:01:17] "GET /api/recycle-bin/ HTTP/1.1" 403 58
Forbidden: /api/recycle-bin/
[08/Jul/2026 09:01:17] "GET /api/recycle-bin/ HTTP/1.1" 403 58
Forbidden: /api/reports/summary/
[08/Jul/2026 09:01:18] "GET /api/reports/summary/?type=summary&dateRange=this-month HTTP/1.1" 403 58
Forbidden: /api/reports/summary/
[08/Jul/2026 09:01:18] "GET /api/reports/summary/?type=summary&dateRange=this-month HTTP/1.1" 403 58
Forbidden: /api/users/
[08/Jul/2026 09:01:18] "GET /api/users/ HTTP/1.1" 403 58
Forbidden: /api/users/
[08/Jul/2026 09:01:18] "GET /api/users/ HTTP/1.1" 403 58
Forbidden: /api/contact/
[08/Jul/2026 09:01:19] "GET /api/contact/ HTTP/1.1" 403 58
Forbidden: /api/contact/
[08/Jul/2026 09:01:19] "GET /api/contact/ HTTP/1.1" 403 58
[08/Jul/2026 09:01:19] "GET /api/content/ HTTP/1.1" 200 5642
[08/Jul/2026 09:01:19] "GET /api/links/ HTTP/1.1" 200 2850
[08/Jul/2026 09:01:19] "GET /api/managed-files/ HTTP/1.1" 200 2
[08/Jul/2026 09:01:19] "GET /api/content/ HTTP/1.1" 200 5642
[08/Jul/2026 09:01:19] "GET /api/links/ HTTP/1.1" 200 2850
[08/Jul/2026 09:01:19] "GET /api/managed-files/ HTTP/1.1" 200 2
[08/Jul/2026 09:01:19] "GET /api/gallery/ HTTP/1.1" 200 366
[08/Jul/2026 09:01:19] "GET /api/gallery/ HTTP/1.1" 200 366
Forbidden: /api/batches/
[08/Jul/2026 09:01:20] "GET /api/batches/ HTTP/1.1" 403 58
Forbidden: /api/batches/
[08/Jul/2026 09:01:20] "GET /api/batches/ HTTP/1.1" 403 58
Forbidden: /api/reports/summary/
[08/Jul/2026 09:01:21] "GET /api/reports/summary/?type=summary&dateRange=this-month HTTP/1.1" 403 58
Forbidden: /api/reports/summary/
[08/Jul/2026 09:01:21] "GET /api/reports/summary/?type=summary&dateRange=this-month HTTP/1.1" 403 58






