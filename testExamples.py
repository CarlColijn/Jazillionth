#
#  This script will try to open all example pages that live under the
#  /examples folder.  It is assumed that such pages live in a relative
#  path like "/examples/<exampleName>/testing/tests.html".
#
import webbrowser
import http.server
import socketserver
import time
import threading
import os
import sys


port = 8000


class OpenExamplePagesThread(threading.Thread):
  def run(self):
    ourPath = os.path.dirname(os.path.realpath(sys.argv[0]))
    examplesPath = os.path.join(ourPath, 'examples')
    exampleFolders = [entry for entry in os.scandir(examplesPath) if entry.is_dir()]
    for exampleFolder in exampleFolders:
      # 1-second delay; give the previous page open time to get
      # fully executed by the browser
      time.sleep(1)
      htmlFilePath = os.path.join(exampleFolder, 'testing', 'tests.html')
      if (not os.path.isfile(htmlFilePath)):
        htmlFilePath = os.path.join(exampleFolder, 'main.html')
      urlSaferelHTMLFilePath = os.path.relpath(htmlFilePath, ourPath).replace('\\', '/')
      exampleURL = f'http://localhost:{port}/{urlSaferelHTMLFilePath}'
      print(f'\n>>> Opening example in browser: {exampleURL}\n')
      webbrowser.open_new_tab(exampleURL)


class NoCacheRequestHandler(http.server.SimpleHTTPRequestHandler):
  def end_headers(self):
    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    self.send_header('Pragma', 'no-cache')
    self.send_header('Expires', '0')

    super().end_headers()


if __name__ == '__main__':
  testServerAddress = ('', port)
  with socketserver.TCPServer(testServerAddress, NoCacheRequestHandler) as testServer:
    openPagesThread = OpenExamplePagesThread()
    openPagesThread.start()

    print(f'Serving at port {port}')
    testServer.serve_forever()