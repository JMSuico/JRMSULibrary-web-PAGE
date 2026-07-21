Internal Server Error: /admin/Features/acquisitionbatch/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:07:41] "GET /admin/Features/acquisitionbatch/ HTTP/1.1" 500 462435
[14/Jul/2026 10:07:44] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/batchhistory/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:07:45] "GET /admin/Features/batchhistory/ HTTP/1.1" 500 462387
[14/Jul/2026 10:07:53] "GET /admin/ HTTP/1.1" 200 10042
[14/Jul/2026 10:07:54] "OPTIONS /api/users/login/ HTTP/1.1" 200 0
Internal Server Error: /admin/auth/group/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:07:55] "GET /admin/auth/group/ HTTP/1.1" 500 462589
[14/Jul/2026 10:07:57] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/auth/group/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:08:06] "GET /admin/auth/group/ HTTP/1.1" 500 462589
[14/Jul/2026 10:08:36] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/acquisitionbatch/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:08:38] "GET /admin/Features/acquisitionbatch/ HTTP/1.1" 500 462435
C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\core\settings.py changed, reloading.
Watching for file changes with StatReloader
Performing system checks...

System check identified no issues (0 silenced).
July 14, 2026 - 10:08:49
Django version 4.2.30, using settings 'core.settings'
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.

[14/Jul/2026 10:08:54] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/batchhistory/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:08:55] "GET /admin/Features/batchhistory/ HTTP/1.1" 500 463156
[14/Jul/2026 10:09:09] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/contactmessage/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:09:11] "GET /admin/Features/contactmessage/ HTTP/1.1" 500 463180
[14/Jul/2026 10:09:21] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/eresourcedepartment/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:09:23] "GET /admin/Features/eresourcedepartment/ HTTP/1.1" 500 463240
[14/Jul/2026 10:09:35] "GET /admin/ HTTP/1.1" 200 10042
[14/Jul/2026 10:09:38] "OPTIONS /api/users/login/ HTTP/1.1" 200 0
Internal Server Error: /admin/Features/feedback/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:09:38] "GET /admin/Features/feedback/ HTTP/1.1" 500 463438
[14/Jul/2026 10:09:40] "POST /api/users/login/ HTTP/1.1" 200 248
[14/Jul/2026 10:09:44] "OPTIONS /api/users/me/ HTTP/1.1" 200 0
[14/Jul/2026 10:09:44] "OPTIONS /api/users/me/ HTTP/1.1" 200 0
[14/Jul/2026 10:10:56] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/libraryinteriorimage/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:11:00] "GET /admin/Features/libraryinteriorimage/ HTTP/1.1" 500 463252
[14/Jul/2026 10:11:22] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/newlyacquiredbook/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:11:25] "GET /admin/Features/newlyacquiredbook/ HTTP/1.1" 500 463216
[14/Jul/2026 10:11:57] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/personnel/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:11:59] "GET /admin/Features/personnel/ HTTP/1.1" 500 463445
[14/Jul/2026 10:12:11] "POST /api/users/login/ HTTP/1.1" 200 248
[14/Jul/2026 10:12:12] "OPTIONS /api/users/me/ HTTP/1.1" 200 0
[14/Jul/2026 10:12:12] "OPTIONS /api/users/me/ HTTP/1.1" 200 0
[14/Jul/2026 10:12:16] "GET /admin/ HTTP/1.1" 200 10042
Internal Server Error: /admin/Features/account/
Traceback (most recent call last):
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\exception.py", line 55, in inner
    response = get_response(request)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\core\handlers\base.py", line 220, in _get_response
    response = response.render()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 114, in render
    self.content = self.rendered_content
                   ^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\response.py", line 92, in rendered_content
    return template.render(context, self._request)
           ~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\backends\django.py", line 61, in render
    return self.template.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 175, in render
    return self._render(context)
           ~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 157, in render
    return compiled_parent._render(context)
           ~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 167, in _render
    return self.nodelist.render(context)
           ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\loader_tags.py", line 63, in render
    result = block.nodelist.render(context)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 1005, in render
    return SafeString("".join([node.render_annotated(context) for node in self]))
                               ~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\base.py", line 966, in render_annotated
    return self.render(context)
           ~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\contrib\admin\templatetags\base.py", line 45, in render
    return super().render(context)
           ~~~~~~~~~~~~~~^^^^^^^^^
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\library.py", line 271, in render
    new_context = context.new(_dict)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 265, in new
    new_context = super().new(values)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 110, in new
    new_context = copy(self)
  File "C:\Users\provu\AppData\Local\Programs\Python\Python314\Lib\copy.py", line 82, in copy
    return copier(x)
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 158, in __copy__
    duplicate = super().__copy__()
  File "C:\Users\provu\Desktop\JRMSU LIBRARY LANDING PAGE\backend\venv\Lib\site-packages\django\template\context.py", line 39, in __copy__
    duplicate.dicts = self.dicts[:]
    ^^^^^^^^^^^^^^^
AttributeError: 'super' object has no attribute 'dicts' and no __dict__ for setting new attributes
[14/Jul/2026 10:12:17] "GET /admin/Features/account/ HTTP/1.1" 500 463426
[14/Jul/2026 10:12:28] "GET /admin/ HTTP/1.1" 200 10042
Not Found: /
[14/Jul/2026 10:12:31] "GET / HTTP/1.1" 404 2287
[14/Jul/2026 10:12:35] "GET /admin/ HTTP/1.1" 200 10042
[14/Jul/2026 10:12:37] "GET /admin/password_change/ HTTP/1.1" 200 9854
[14/Jul/2026 10:12:38] "GET /static/admin/css/forms.css HTTP/1.1" 200 9090
[14/Jul/2026 10:12:38] "GET /static/admin/css/widgets.css HTTP/1.1" 200 11921
[14/Jul/2026 10:12:48] "GET /admin/ HTTP/1.1" 200 10042
Not Found: /
[14/Jul/2026 10:12:51] "GET / HTTP/1.1" 404 2287
