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
      webbrowser.open('http://localhost:{port}/examples/{folder}/testing/tests.html'.format(port=port, folder=exampleFolder.name), new=2)


testServerAddress = ('', port)
testServer = socketserver.TCPServer(testServerAddress, http.server.SimpleHTTPRequestHandler)

openPagesThread = OpenExamplePagesThread()
openPagesThread.start()

testServer.serve_forever()