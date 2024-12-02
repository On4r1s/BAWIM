Wejść na stronę https://google-gruyere.appspot.com/start \
Aby móc tam coś robić trzeba stworzyć użytkownika i się zalogować.
Jest to kiepsko zabezpieczona strona dobra do ćwiczeń.
Dodatkowo, pomocne mogą być linki:
https://google-gruyere.appspot.com/code/
https://google-gruyere.appspot.com

# Zadanie 1.
Wykonaj "atak" reflected xss za pomocą URL, jako rozwiązanie przesłać screen z wyświetlonym alertem oraz zmodyfikowany URL.

# Zadanie 2.
Umieść w gruyere stored xss. Może to być np. mouseover po najechaniu na który wyświetli się alert. Jako rozwiązanie pokazać screen oraz wklejony kod.\
Hint: snippets

# Zadanie 3.
XSRF: stwórz link który spowoduje, że użytkownik po kliknięciu na niego usunie swój wpis. Jako rozwiązanie podaj utworzony URL.

# Zadanie 4.
Za pomocą postmana wyślij żądanie, które spowoduje (bez autoryzacji przez discorda) zmianę nazwy bota w naszej aplikacji ( do ekranu logowania trzeba się zalogować przez discorda, żeby potwierdzić zmianę nazwy bota ). \
Jako rozwiązanie wyślij URL na który wysyłasz żądanie, metodę, jego treść i dodatkowe niezbędne atrybuty.

Instalacja aplikacji:
Pobrać folder nonSecure\
Pobrać i wrzucić obok tego folderu Bawim.db\
Otworzyć projekt (folder nonSecure) w pycharmie\
venv activate: wiersz poleceń jako administrator, uruchom z folderu z projektem venv\Scripts\activate\
pip install flask, requests, pillow\
pip list: pokazuje jakie packages są zainstalowane\
można pip install -r requirements.txt, jak nie działa ( np. przy python 3.13 ) to instalować najnowsze wersje manualnie, jak wyżej\
ustawić zmienne środowiskowe: APP_TOKEN=1; APP_SECRET=1\
robimy to przez run -> edit configurations -> nowa -> plik app.py -> w environmental variables ustawiamy powyższe.\
flask run w cmd w pycharmie\
wyświetli się w konsoli na jakim adresie działa appka\

instalator postmana: https://www.postman.com/downloads/

Hinty: spojrzeć na POST w app.py, struktura JSON - body
