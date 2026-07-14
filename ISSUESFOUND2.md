issues


AttributeError at /admin/auth/group/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/auth/group/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:08:06 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/auth/group/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x0000028C0DD92710>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.


AttributeError at /admin/Features/acquisitionbatch/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/acquisitionbatch/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:08:38 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/acquisitionbatch/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x0000028C0DFA2890>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

AttributeError at /admin/Features/batchhistory/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/batchhistory/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:08:55 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/batchhistory/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B8088100>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

AttributeError at /admin/Features/contactmessage/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/contactmessage/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:09:11 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/contactmessage/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B5C86920>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

AttributeError at /admin/Features/eresourcedepartment/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/eresourcedepartment/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:09:23 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/eresourcedepartment/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B7E4FE20>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

AttributeError at /admin/Features/libraryinteriorimage/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/libraryinteriorimage/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:11:00 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/libraryinteriorimage/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B821D570>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.


AttributeError at /admin/Features/newlyacquiredbook/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/newlyacquiredbook/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:11:25 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/newlyacquiredbook/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B7E4EA70>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

AttributeError at /admin/Features/personnel/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/personnel/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:11:59 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/personnel/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B821DAB0>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

AttributeError at /admin/Features/account/
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Request Method:	GET
Request URL:	http://127.0.0.1:8000/admin/Features/account/
Django Version:	4.2.30
Exception Type:	AttributeError
Exception Value:	
'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
Exception Location:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
Raised during:	django.contrib.admin.options.changelist_view
Python Executable:	C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\scripts\python.exe
Python Version:	3.14.3
Python Path:	
['C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\python314.zip',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\DLLs',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Lib',
 'C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv',
 'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\Lib\\site-packages']
Server time:	Tue, 14 Jul 2026 10:12:17 +0800
Error during template rendering
In template C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templates\admin\change_list.html, error at line 46

'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
36	{% endblock %}
37	{% endif %}
38	
39	{% block coltype %}{% endblock %}
40	
41	{% block content %}
42	  <div id="content-main">
43	    {% block object-tools %}
44	        <ul class="object-tools">
45	          {% block object-tools-items %}
46	            {% change_list_object_tools %}
47	          {% endblock %}
48	        </ul>
49	    {% endblock %}
50	    {% if cl.formset and cl.formset.errors %}
51	        <p class="errornote">
52	        {% blocktranslate count counter=cl.formset.total_error_count %}Please correct the error below.{% plural %}Please correct the errors below.{% endblocktranslate %}
53	        </p>
54	        {{ cl.formset.non_form_errors }}
55	    {% endif %}
56	    <div class="module{% if cl.has_filters %} filtered{% endif %}" id="changelist">
Traceback Switch to copy-and-paste view
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py, line 55, in inner
                response = get_response(request)
                               ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py, line 220, in _get_response
                response = response.render()
                                ^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 114, in render
            self.content = self.rendered_content
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py, line 92, in rendered_content
        return template.render(context, self._request)
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py, line 61, in render
            return self.template.render(context)
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 175, in render
                    return self._render(context)
                                ^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 157, in render
            return compiled_parent._render(context)
                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 167, in _render
        return self.nodelist.render(context)
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py, line 63, in render
                result = block.nodelist.render(context)
                             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 1005, in render
        return SafeString("".join([node.render_annotated(context) for node in self]))
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py, line 966, in render_annotated
            return self.render(context)
                        ^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py, line 45, in render
        return super().render(context)
                   ^^^^^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py, line 271, in render
        new_context = context.new(_dict)
                           ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 265, in new
        new_context = super().new(values)
                           ^^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 110, in new
        new_context = copy(self)
                           ^^^^^^^^^^ …
Local vars
C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py, line 82, in copy
        return copier(x)
                   ^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 158, in __copy__
        duplicate = super().__copy__()
                         ^^^^^^^^^^^^^^^^^^ …
Local vars
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py, line 39, in __copy__
        duplicate.dicts = self.dicts[:]
            ^^^^^^^^^^^^^^^ …
Local vars
Request information
USER
JRMSU Library Administrator (librarian@jrmsu.edu.ph)

GET
No GET data

POST
No POST data

FILES
No FILES data

COOKIES
Variable	Value
csrftoken	
'********************'
sessionid	
'********************'
META
Variable	Value
ALLOWED_CORS_ORIGINS	
'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173'
ALLUSERSPROFILE	
'C:\\ProgramData'
API_BASE_URL	
'********************'
APPDATA	
'C:\\Users\\provu\\AppData\\Roaming'
COMMONPROGRAMFILES	
'C:\\Program Files\\Common Files'
COMMONPROGRAMFILES(X86)	
'C:\\Program Files (x86)\\Common Files'
COMMONPROGRAMW6432	
'C:\\Program Files\\Common Files'
COMPUTERNAME	
'DESKTOP-4PMETBT'
COMSPEC	
'C:\\WINDOWS\\system32\\cmd.exe'
CONFIGSETROOT	
'C:\\WINDOWS\\ConfigSetRoot'
CONTENT_LENGTH	
''
CONTENT_TYPE	
'text/plain'
CSRF_COOKIE	
'r2oGhvGTUPVr870QNRHeIfl6kcDiodU2'
CSRF_COOKIE_NEEDS_UPDATE	
True
DB_ENGINE	
'mssql'
DB_HOST	
'localhost'
DB_MSSQL_DRIVER	
'ODBC Driver 17 for SQL Server'
DB_NAME	
'JRMSUKatipunanCampusLibrary'
DB_PASSWORD	
'********************'
DB_PORT	
'1433'
DB_USER	
''
DB_WINDOWS_AUTH	
'True'
DJANGO_ALLOWED_HOSTS	
'localhost,127.0.0.1'
DJANGO_DEBUG	
'True'
DJANGO_SECRET_KEY	
'********************'
DJANGO_SETTINGS_MODULE	
'core.settings'
DRIVERDATA	
'C:\\Windows\\System32\\Drivers\\DriverData'
EMAIL_HOST_PASSWORD	
'********************'
GATEWAY_INTERFACE	
'CGI/1.1'
HOMEDRIVE	
'C:'
HOMEPATH	
'\\Users\\provu'
HTTP_ACCEPT	
'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'
HTTP_ACCEPT_ENCODING	
'gzip, deflate, br, zstd'
HTTP_ACCEPT_LANGUAGE	
'en-US,en;q=0.9'
HTTP_CONNECTION	
'keep-alive'
HTTP_COOKIE	
'********************'
HTTP_HOST	
'127.0.0.1:8000'
HTTP_REFERER	
'http://127.0.0.1:8000/admin/'
HTTP_SEC_CH_UA	
'"Not;A=Brand";v="8", "Chromium";v="150", "Google Chrome";v="150"'
HTTP_SEC_CH_UA_MOBILE	
'?0'
HTTP_SEC_CH_UA_PLATFORM	
'"Windows"'
HTTP_SEC_FETCH_DEST	
'document'
HTTP_SEC_FETCH_MODE	
'navigate'
HTTP_SEC_FETCH_SITE	
'same-origin'
HTTP_SEC_FETCH_USER	
'?1'
HTTP_UPGRADE_INSECURE_REQUESTS	
'1'
HTTP_USER_AGENT	
('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like '
 'Gecko) Chrome/150.0.0.0 Safari/537.36')
INTEL_DEV_REDIST	
'C:\\Program Files (x86)\\Common Files\\Intel\\Shared Libraries\\'
LEVEL_ZERO_V1_SDK_PATH	
'C:\\Program Files\\LevelZeroSDK\\1.24.0\\'
LOCALAPPDATA	
'C:\\Users\\provu\\AppData\\Local'
LOGONSERVER	
'\\\\DESKTOP-4PMETBT'
MIC_LD_LIBRARY_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\compiler\\lib\\mic')
MYSQL_CONN	
('server=localhost;user '
 'id=root;password=yourpassword;database=onlinestore;Allow User Variables=true')
NUMBER_OF_PROCESSORS	
'8'
OLLAMA_HOST	
'127.0.0.1:11434'
ONEDRIVE	
'C:\\Users\\provu\\OneDrive'
ONEDRIVECONSUMER	
'C:\\Users\\provu\\OneDrive'
OPENSSL_CONF	
'C:\\Program Files\\PostgreSQL\\psqlODBC\\etc\\openssl.cnf'
OS	
'Windows_NT'
PATH	
('C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING '
 'PAGE\\backend\\venv\\scripts;C:\\Program Files (x86)\\Common '
 'Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
PATHEXT	
'.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC;.CPL'
PATH_INFO	
'/admin/Features/account/'
PROCESSOR_ARCHITECTURE	
'AMD64'
PROCESSOR_IDENTIFIER	
'Intel64 Family 6 Model 140 Stepping 2, GenuineIntel'
PROCESSOR_LEVEL	
'6'
PROCESSOR_REVISION	
'8c02'
PROGRAMDATA	
'C:\\ProgramData'
PROGRAMFILES	
'C:\\Program Files'
PROGRAMFILES(X86)	
'C:\\Program Files (x86)'
PROGRAMW6432	
'C:\\Program Files'
PSMODULEPATH	
('C:\\Users\\provu\\Documents\\WindowsPowerShell\\Modules;C:\\Program '
 'Files\\WindowsPowerShell\\Modules;C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\Modules;C:\\Program '
 'Files (x86)\\Microsoft SQL Server\\150\\Tools\\PowerShell\\Modules\\')
PUBLIC	
'C:\\Users\\Public'
QUERY_STRING	
''
REMOTE_ADDR	
'127.0.0.1'
REMOTE_HOST	
''
REQUEST_METHOD	
'GET'
RUN_MAIN	
'true'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SCRIPT_NAME	
''
SERVER_NAME	
'checkhost.local'
SERVER_PORT	
'8000'
SERVER_PROTOCOL	
'HTTP/1.1'
SERVER_SOFTWARE	
'WSGIServer/0.2'
SESSIONNAME	
'Console'
SYSTEMDRIVE	
'C:'
SYSTEMROOT	
'C:\\WINDOWS'
TEMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
TMP	
'C:\\Users\\provu\\AppData\\Local\\Temp'
USERDOMAIN	
'DESKTOP-4PMETBT'
USERDOMAIN_ROAMINGPROFILE	
'DESKTOP-4PMETBT'
USERNAME	
'User'
USERPROFILE	
'C:\\Users\\provu'
VIRTUAL_ENV	
'C:\\Users\\provu\\Desktop\\JRMSU LIBRARY LANDING PAGE\\backend\\venv'
VIRTUAL_ENV_PROMPT	
'venv'
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WINDIR	
'C:\\WINDOWS'
WSLENV	
'WT_SESSION:WT_PROFILE_ID:'
WT_PROFILE_ID	
'{61c54bbd-c2c6-5271-96e7-009a87ff44bf}'
WT_SESSION	
'38c58308-9db3-4d26-8ad2-4f7893b74761'
ZES_ENABLE_SYSMAN	
'1'
_OLD_VIRTUAL_PATH	
('C:\\Program Files (x86)\\Common Files\\Intel\\Shared '
 'Libraries\\redist\\intel64\\compiler;C:\\WINDOWS\\system32;C:\\WINDOWS;C:\\WINDOWS\\System32\\Wbem;C:\\WINDOWS\\System32\\WindowsPowerShell\\v1.0\\;C:\\WINDOWS\\System32\\OpenSSH\\;C:\\Program '
 'Files\\dotnet\\;C:\\Program Files\\nodejs\\;C:\\Program '
 'Files\\Git\\cmd;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\160\\DTS\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\170\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL Server\\Client '
 'SDK\\ODBC\\170\\Tools\\Binn\\;C:\\Program Files (x86)\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\Tools\\Binn\\;C:\\Program Files\\Microsoft SQL '
 'Server\\150\\DTS\\Binn\\;C:\\Program Files (x86)\\Windows Kits\\10\\Windows '
 'Performance Toolkit\\;C:\\Program '
 'Files\\Docker\\Docker\\resources\\bin;C:\\Users\\provu\\AppData\\Local\\agy\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python314\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Launcher\\;C:\\Users\\provu\\.local\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python39\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\Scripts\\;C:\\Users\\provu\\AppData\\Local\\Programs\\Python\\Python312\\;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WindowsApps;C:\\Users\\provu\\AppData\\Roaming\\npm;C:\\Users\\provu\\.lmstudio\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Ollama;C:\\Users\\provu\\.dotnet\\tools;C:\\Users\\provu\\AppData\\Local\\Microsoft\\WinGet\\Packages\\jqlang.jq_Microsoft.Winget.Source_8wekyb3d8bbwe;C:\\Users\\provu\\AppData\\Local\\Python\\bin;C:\\Program '
 'Files\\Azure Data '
 'Studio\\bin;;;;;;;;;;;;;;;;;;C:\\Users\\provu\\AppData\\Local\\Programs\\Microsoft '
 'VS '
 'Code\\bin;;C:\\Users\\provu\\AppData\\Local\\Programs\\Warp\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Windsurf\\bin;C:\\Users\\provu\\AppData\\Local\\Programs\\Antigravity '
 'IDE\\bin')
wsgi.errors	
<_io.TextIOWrapper name='<stderr>' mode='w' encoding='utf-8'>
wsgi.file_wrapper	
<class 'wsgiref.util.FileWrapper'>
wsgi.input	
<django.core.handlers.wsgi.LimitedStream object at 0x00000204B8088B50>
wsgi.multiprocess	
False
wsgi.multithread	
True
wsgi.run_once	
False
wsgi.url_scheme	
'http'
wsgi.version	
(1, 0)
Settings
Using settings module core.settings
Setting	Value
ABSOLUTE_URL_OVERRIDES	
{}
ADMINS	
[]
ALLOWED_HOSTS	
['localhost', '127.0.0.1']
APPEND_SLASH	
True
AUTHENTICATION_BACKENDS	
['django.contrib.auth.backends.ModelBackend']
AUTH_PASSWORD_VALIDATORS	
'********************'
AUTH_USER_MODEL	
'Features.Account'
BASE_DIR	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend')
CACHES	
{'default': {'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
             'LOCATION': 'jrmsu-library-cache'}}
CACHE_MIDDLEWARE_ALIAS	
'default'
CACHE_MIDDLEWARE_KEY_PREFIX	
'********************'
CACHE_MIDDLEWARE_SECONDS	
600
CORS_ALLOWED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CORS_ALLOW_CREDENTIALS	
True
CSRF_COOKIE_AGE	
31449600
CSRF_COOKIE_DOMAIN	
None
CSRF_COOKIE_HTTPONLY	
False
CSRF_COOKIE_MASKED	
False
CSRF_COOKIE_NAME	
'csrftoken'
CSRF_COOKIE_PATH	
'/'
CSRF_COOKIE_SAMESITE	
'Lax'
CSRF_COOKIE_SECURE	
False
CSRF_FAILURE_VIEW	
'django.views.csrf.csrf_failure'
CSRF_HEADER_NAME	
'HTTP_X_CSRFTOKEN'
CSRF_TRUSTED_ORIGINS	
['http://localhost:3000',
 'http://127.0.0.1:3000',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:5173',
 'http://127.0.0.1:5173',
 'http://localhost:3001',
 'http://127.0.0.1:3001',
 'http://localhost:3002',
 'http://127.0.0.1:3002']
CSRF_USE_SESSIONS	
False
DATABASES	
{'default': {'ATOMIC_REQUESTS': False,
             'AUTOCOMMIT': True,
             'CONN_HEALTH_CHECKS': False,
             'CONN_MAX_AGE': 0,
             'ENGINE': 'mssql',
             'HOST': 'localhost',
             'NAME': 'JRMSUKatipunanCampusLibrary',
             'OPTIONS': {'driver': 'ODBC Driver 17 for SQL Server',
                         'extra_params': 'Trusted_Connection=yes;'},
             'PASSWORD': '********************',
             'PORT': '1433',
             'TEST': {'CHARSET': None,
                      'COLLATION': None,
                      'MIGRATE': True,
                      'MIRROR': None,
                      'NAME': None},
             'TIME_ZONE': None,
             'USER': ''}}
DATABASE_ROUTERS	
[]
DATA_UPLOAD_MAX_MEMORY_SIZE	
104857600
DATA_UPLOAD_MAX_NUMBER_FIELDS	
1000
DATA_UPLOAD_MAX_NUMBER_FILES	
100
DATETIME_FORMAT	
'N j, Y, P'
DATETIME_INPUT_FORMATS	
['%Y-%m-%d %H:%M:%S',
 '%Y-%m-%d %H:%M:%S.%f',
 '%Y-%m-%d %H:%M',
 '%m/%d/%Y %H:%M:%S',
 '%m/%d/%Y %H:%M:%S.%f',
 '%m/%d/%Y %H:%M',
 '%m/%d/%y %H:%M:%S',
 '%m/%d/%y %H:%M:%S.%f',
 '%m/%d/%y %H:%M']
DATE_FORMAT	
'N j, Y'
DATE_INPUT_FORMATS	
['%Y-%m-%d',
 '%m/%d/%Y',
 '%m/%d/%y',
 '%b %d %Y',
 '%b %d, %Y',
 '%d %b %Y',
 '%d %b, %Y',
 '%B %d %Y',
 '%B %d, %Y',
 '%d %B %Y',
 '%d %B, %Y']
DB_ENGINE	
'mssql'
DEBUG	
True
DEBUG_PROPAGATE_EXCEPTIONS	
False
DECIMAL_SEPARATOR	
'.'
DEFAULT_AUTO_FIELD	
'django.db.models.BigAutoField'
DEFAULT_CHARSET	
'utf-8'
DEFAULT_EXCEPTION_REPORTER	
'django.views.debug.ExceptionReporter'
DEFAULT_EXCEPTION_REPORTER_FILTER	
'django.views.debug.SafeExceptionReporterFilter'
DEFAULT_FILE_STORAGE	
'django.core.files.storage.FileSystemStorage'
DEFAULT_FROM_EMAIL	
'JRMSU-KC Library <katipunan.library@jrmsu.edu.ph>'
DEFAULT_INDEX_TABLESPACE	
''
DEFAULT_TABLESPACE	
''
DISALLOWED_USER_AGENTS	
[]
EMAIL_BACKEND	
'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST	
'smtp.gmail.com'
EMAIL_HOST_PASSWORD	
'********************'
EMAIL_HOST_USER	
'katipunan.library@jrmsu.edu.ph'
EMAIL_PORT	
587
EMAIL_SSL_CERTFILE	
None
EMAIL_SSL_KEYFILE	
'********************'
EMAIL_SUBJECT_PREFIX	
'[Django] '
EMAIL_TIMEOUT	
60
EMAIL_USE_LOCALTIME	
False
EMAIL_USE_SSL	
False
EMAIL_USE_TLS	
True
FILE_UPLOAD_DIRECTORY_PERMISSIONS	
None
FILE_UPLOAD_HANDLERS	
['django.core.files.uploadhandler.MemoryFileUploadHandler',
 'django.core.files.uploadhandler.TemporaryFileUploadHandler']
FILE_UPLOAD_MAX_MEMORY_SIZE	
104857600
FILE_UPLOAD_PERMISSIONS	
420
FILE_UPLOAD_TEMP_DIR	
None
FIRST_DAY_OF_WEEK	
0
FIXTURE_DIRS	
[]
FORCE_SCRIPT_NAME	
None
FORMAT_MODULE_PATH	
None
FORM_RENDERER	
'django.forms.renderers.DjangoTemplates'
IGNORABLE_404_URLS	
[]
INSTALLED_APPS	
['django.contrib.admin',
 'django.contrib.auth',
 'django.contrib.contenttypes',
 'django.contrib.sessions',
 'django.contrib.messages',
 'django.contrib.staticfiles',
 'rest_framework',
 'django_filters',
 'corsheaders',
 'Features']
INTERNAL_IPS	
[]
LANGUAGES	
[('af', 'Afrikaans'),
 ('ar', 'Arabic'),
 ('ar-dz', 'Algerian Arabic'),
 ('ast', 'Asturian'),
 ('az', 'Azerbaijani'),
 ('bg', 'Bulgarian'),
 ('be', 'Belarusian'),
 ('bn', 'Bengali'),
 ('br', 'Breton'),
 ('bs', 'Bosnian'),
 ('ca', 'Catalan'),
 ('ckb', 'Central Kurdish (Sorani)'),
 ('cs', 'Czech'),
 ('cy', 'Welsh'),
 ('da', 'Danish'),
 ('de', 'German'),
 ('dsb', 'Lower Sorbian'),
 ('el', 'Greek'),
 ('en', 'English'),
 ('en-au', 'Australian English'),
 ('en-gb', 'British English'),
 ('eo', 'Esperanto'),
 ('es', 'Spanish'),
 ('es-ar', 'Argentinian Spanish'),
 ('es-co', 'Colombian Spanish'),
 ('es-mx', 'Mexican Spanish'),
 ('es-ni', 'Nicaraguan Spanish'),
 ('es-ve', 'Venezuelan Spanish'),
 ('et', 'Estonian'),
 ('eu', 'Basque'),
 ('fa', 'Persian'),
 ('fi', 'Finnish'),
 ('fr', 'French'),
 ('fy', 'Frisian'),
 ('ga', 'Irish'),
 ('gd', 'Scottish Gaelic'),
 ('gl', 'Galician'),
 ('he', 'Hebrew'),
 ('hi', 'Hindi'),
 ('hr', 'Croatian'),
 ('hsb', 'Upper Sorbian'),
 ('hu', 'Hungarian'),
 ('hy', 'Armenian'),
 ('ia', 'Interlingua'),
 ('id', 'Indonesian'),
 ('ig', 'Igbo'),
 ('io', 'Ido'),
 ('is', 'Icelandic'),
 ('it', 'Italian'),
 ('ja', 'Japanese'),
 ('ka', 'Georgian'),
 ('kab', 'Kabyle'),
 ('kk', 'Kazakh'),
 ('km', 'Khmer'),
 ('kn', 'Kannada'),
 ('ko', 'Korean'),
 ('ky', 'Kyrgyz'),
 ('lb', 'Luxembourgish'),
 ('lt', 'Lithuanian'),
 ('lv', 'Latvian'),
 ('mk', 'Macedonian'),
 ('ml', 'Malayalam'),
 ('mn', 'Mongolian'),
 ('mr', 'Marathi'),
 ('ms', 'Malay'),
 ('my', 'Burmese'),
 ('nb', 'Norwegian Bokmål'),
 ('ne', 'Nepali'),
 ('nl', 'Dutch'),
 ('nn', 'Norwegian Nynorsk'),
 ('os', 'Ossetic'),
 ('pa', 'Punjabi'),
 ('pl', 'Polish'),
 ('pt', 'Portuguese'),
 ('pt-br', 'Brazilian Portuguese'),
 ('ro', 'Romanian'),
 ('ru', 'Russian'),
 ('sk', 'Slovak'),
 ('sl', 'Slovenian'),
 ('sq', 'Albanian'),
 ('sr', 'Serbian'),
 ('sr-latn', 'Serbian Latin'),
 ('sv', 'Swedish'),
 ('sw', 'Swahili'),
 ('ta', 'Tamil'),
 ('te', 'Telugu'),
 ('tg', 'Tajik'),
 ('th', 'Thai'),
 ('tk', 'Turkmen'),
 ('tr', 'Turkish'),
 ('tt', 'Tatar'),
 ('udm', 'Udmurt'),
 ('uk', 'Ukrainian'),
 ('ur', 'Urdu'),
 ('uz', 'Uzbek'),
 ('vi', 'Vietnamese'),
 ('zh-hans', 'Simplified Chinese'),
 ('zh-hant', 'Traditional Chinese')]
LANGUAGES_BIDI	
['he', 'ar', 'ar-dz', 'ckb', 'fa', 'ur']
LANGUAGE_CODE	
'en-us'
LANGUAGE_COOKIE_AGE	
None
LANGUAGE_COOKIE_DOMAIN	
None
LANGUAGE_COOKIE_HTTPONLY	
False
LANGUAGE_COOKIE_NAME	
'django_language'
LANGUAGE_COOKIE_PATH	
'/'
LANGUAGE_COOKIE_SAMESITE	
None
LANGUAGE_COOKIE_SECURE	
False
LOCALE_PATHS	
[]
LOGGING	
{}
LOGGING_CONFIG	
'logging.config.dictConfig'
LOGIN_REDIRECT_URL	
'/accounts/profile/'
LOGIN_URL	
'/accounts/login/'
LOGOUT_REDIRECT_URL	
None
MANAGERS	
[]
MEDIA_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/media')
MEDIA_URL	
'/media/'
MESSAGE_STORAGE	
'django.contrib.messages.storage.fallback.FallbackStorage'
MIDDLEWARE	
['django.middleware.security.SecurityMiddleware',
 'django.contrib.sessions.middleware.SessionMiddleware',
 'corsheaders.middleware.CorsMiddleware',
 'django.middleware.common.CommonMiddleware',
 'django.middleware.csrf.CsrfViewMiddleware',
 'django.contrib.auth.middleware.AuthenticationMiddleware',
 'django.contrib.messages.middleware.MessageMiddleware',
 'core.middleware.AuditLogMiddleware',
 'core.middleware.CSPMiddleware']
MIGRATION_MODULES	
{}
MONTH_DAY_FORMAT	
'F j'
NUMBER_GROUPING	
0
PASSWORD_HASHERS	
'********************'
PASSWORD_RESET_TIMEOUT	
'********************'
PREPEND_WWW	
False
REST_FRAMEWORK	
{'DEFAULT_AUTHENTICATION_CLASSES': ['rest_framework.authentication.SessionAuthentication'],
 'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
 'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticatedOrReadOnly'],
 'DEFAULT_THROTTLE_RATES': {'anon': '5000/hour',
                            'chat': '200/hour',
                            'contact': '200/hour',
                            'feedback': '30/hour',
                            'login': '10/minute',
                            'user': '10000/hour'},
 'DEFAULT_VERSIONING_CLASS': 'rest_framework.versioning.AcceptHeaderVersioning',
 'PAGE_SIZE': 20}
ROOT_URLCONF	
'core.urls'
SCHOLAAR_PASSWORD	
'********************'
SCHOLAAR_USERNAME	
'jrmsukc'
SECRET_KEY	
'********************'
SECRET_KEY_FALLBACKS	
'********************'
SECURE_CONTENT_TYPE_NOSNIFF	
True
SECURE_CROSS_ORIGIN_OPENER_POLICY	
'same-origin'
SECURE_HSTS_INCLUDE_SUBDOMAINS	
False
SECURE_HSTS_PRELOAD	
False
SECURE_HSTS_SECONDS	
0
SECURE_PROXY_SSL_HEADER	
None
SECURE_REDIRECT_EXEMPT	
[]
SECURE_REFERRER_POLICY	
'same-origin'
SECURE_SSL_HOST	
None
SECURE_SSL_REDIRECT	
False
SERVER_EMAIL	
'root@localhost'
SESSION_CACHE_ALIAS	
'default'
SESSION_COOKIE_AGE	
43200
SESSION_COOKIE_DOMAIN	
None
SESSION_COOKIE_HTTPONLY	
True
SESSION_COOKIE_NAME	
'sessionid'
SESSION_COOKIE_PATH	
'/'
SESSION_COOKIE_SAMESITE	
'Lax'
SESSION_COOKIE_SECURE	
False
SESSION_ENGINE	
'django.contrib.sessions.backends.db'
SESSION_EXPIRE_AT_BROWSER_CLOSE	
True
SESSION_FILE_PATH	
None
SESSION_SAVE_EVERY_REQUEST	
False
SESSION_SERIALIZER	
'django.contrib.sessions.serializers.JSONSerializer'
SETTINGS_MODULE	
'core.settings'
SHORT_DATETIME_FORMAT	
'm/d/Y P'
SHORT_DATE_FORMAT	
'm/d/Y'
SIGNING_BACKEND	
'django.core.signing.TimestampSigner'
SILENCED_SYSTEM_CHECKS	
[]
STATICFILES_DIRS	
[]
STATICFILES_FINDERS	
['django.contrib.staticfiles.finders.FileSystemFinder',
 'django.contrib.staticfiles.finders.AppDirectoriesFinder']
STATICFILES_STORAGE	
'django.contrib.staticfiles.storage.StaticFilesStorage'
STATIC_ROOT	
WindowsPath('C:/Users/provu/Desktop/JRMSU LIBRARY LANDING PAGE/backend/staticfiles')
STATIC_URL	
'/static/'
STORAGES	
{'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
 'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'}}
TEMPLATES	
[{'APP_DIRS': True,
  'BACKEND': 'django.template.backends.django.DjangoTemplates',
  'DIRS': [],
  'OPTIONS': {'context_processors': ['django.template.context_processors.request',
                                     'django.contrib.auth.context_processors.auth',
                                     'django.contrib.messages.context_processors.messages']}}]
TEST_NON_SERIALIZED_APPS	
[]
TEST_RUNNER	
'django.test.runner.DiscoverRunner'
THOUSAND_SEPARATOR	
','
TIME_FORMAT	
'P'
TIME_INPUT_FORMATS	
['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
TIME_ZONE	
'Asia/Manila'
USE_DEPRECATED_PYTZ	
False
USE_I18N	
True
USE_L10N	
True
USE_THOUSAND_SEPARATOR	
False
USE_TZ	
True
USE_X_FORWARDED_HOST	
False
USE_X_FORWARDED_PORT	
False
VITALSOURCE_EMAIL	
'jrmsukclibrary@gmail.com'
VITALSOURCE_PASSWORD	
'********************'
WSGI_APPLICATION	
'core.wsgi.application'
X_FRAME_OPTIONS	
'DENY'
YEAR_MONTH_FORMAT	
'F Y'
You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard page generated by the handler for this status code.

Page not found (404)
Request Method:	GET
Request URL:	http://127.0.0.1:8000/
Using the URLconf defined in core.urls, Django tried these URL patterns, in this order:

admin/
api/
^media/(?P<path>.*)$
The empty path didn’t match any of these.

You’re seeing this error because you have DEBUG = True in your Django settings file. Change that to False, and Django will display a standard 404 page.



