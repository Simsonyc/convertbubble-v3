\# Architecture — ConvertBubble Builder V3



\## Règle fondamentale (NON NÉGOCIABLE)



Aucun fichier situé dans `/modules` n’a le droit de produire,

modifier ou exporter `ConfigV3` directement.



\## Séparation stricte des responsabilités



\- `/core`

&nbsp; - logique métier pure

&nbsp; - état global

&nbsp; - génération de `ConfigV3`

&nbsp; - aucune dépendance DOM ou navigateur



\- `/modules`

&nbsp; - UI uniquement

&nbsp; - écoute des événements utilisateur

&nbsp; - appels à `dispatch(action)`

&nbsp; - lecture via selectors



\- `/bridge`

&nbsp; - transport de données

&nbsp; - aucune logique métier



Toute violation de ces règles doit être considérée comme un bug

architectural.



