## FIAP Tech-Challenge 8SOAT - Grupo 04 - Microsserviço de Pedidos

### Introdução

Este microsserviço faz parte de um sistema de controle de pedidos para uma lanchonete em expansão. Ele é responsável exclusivamente pelo gerenciamento de pedidos, produtos e categorias, garantindo um fluxo eficiente desde a seleção dos itens até o acompanhamento da produção do pedido.

_Para visualizar a documentação geral do projeto, acesse este [repositório](https://github.com/8SOAT-G4-Tech-Challenge/tech-challenge-fiap-documentation)._

### Objetivo

Este serviço tem como objetivo gerenciar todas as operações relacionadas a pedidos, produtos e categorias dentro do sistema da lanchonete.

A partir dos dados fornecidos, este microsserviço:

- Gerencia as categorias de produtos: permite a criação, atualização e exclusão de categorias de produtos. As categorias são utilizadas para organizar os produtos e facilitar a navegação e o gerenciamento do catálogo.

- Gerencia os produtos: possibilita o cadastro, atualização e remoção de produtos que podem ser comercializados nos pedidos. Cada produto possui atributos como nome, descrição, imagens, preço e categoria associada.

- Gerencia os pedidos: permite a criação, atualização e exclusão de pedidos realizados pelos clientes. Um pedido contém múltiplos itens e tem status que refletem seu progresso, como "pendente", "em preparo", "pronto", entre outros.

- Gera e controla a lógica de número de pedido: atribui um identificador único e legível para cada pedido, permitindo que o cliente acompanhe a produção em tempo real.

- Gerencia os itens de pedido: os itens de pedido são os produtos adicionados a um pedido específico. Este serviço controla a inclusão, remoção e edição desses itens, garantindo a integridade do pedido.

### Participantes

- Amanda Maschio - RM 357734
- Jackson Antunes - RM357311
- Lucas Accurcio - RM 357142
- Vanessa Freitas - RM 357999
- Winderson Santos - RM 357315
