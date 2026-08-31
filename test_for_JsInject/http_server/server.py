from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "0.0.0.0"
PORT = 8000
WEB_ROOT = Path(__file__).resolve().parent


class DevelopmentHandler(SimpleHTTPRequestHandler):
    """Serve static frontend files without browser caching."""

    def do_GET(self):
        if self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/pages/index/index.html")
            self.end_headers()
            return

        for header_name in ("If-Modified-Since", "If-None-Match"):
            if header_name in self.headers:
                del self.headers[header_name]
        super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()



def main():
    handler = partial(DevelopmentHandler, directory=str(WEB_ROOT))

    try:
        with ThreadingHTTPServer((HOST, PORT), handler) as server:
            print(f"Frontend directory: {WEB_ROOT}")
            print(f"Local URL: http://127.0.0.1:{PORT}")
            print(f"Listening on: http://{HOST}:{PORT}")
            print("Press Ctrl+C to stop.")

            try:
                server.serve_forever()
            except KeyboardInterrupt:
                print("\nServer stopped.")
    except OSError as error:
        raise SystemExit(f"Unable to start server on {HOST}:{PORT}: {error}") from error


if __name__ == "__main__":
    main()

