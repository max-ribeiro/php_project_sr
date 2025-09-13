FROM php:7.4-fpm

# Dependências básicas do sistema
RUN apt-get update && apt-get install -y \
    curl \
    gnupg2 \
    apt-transport-https \
    build-essential \
    g++ \
    libssl-dev \
    libxml2-dev \
    libonig-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    unixodbc-dev \
    libltdl-dev \
    libtool \
    autoconf \
    libgssapi-krb5-2 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Adicionar repositório Microsoft para ODBC
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list

# Instalar ODBC e mssql-tools
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Adicionar mssql-tools ao PATH
ENV PATH="$PATH:/opt/mssql-tools/bin"

# (opcional: downgrade libssl1.1, se necessário para compilar os drivers)
RUN apt-get update && apt-get install -y --allow-downgrades libssl1.1=1.1.1d-0+deb10u6 || true

# Instalar extensões PHP SQL Server

# Clean up problematic .la files and fix ODBC linking issues
RUN find /usr -name "*.la" -delete 2>/dev/null || true \
    && ln -sf /usr/lib/x86_64-linux-gnu/libodbc.so.2 /usr/lib/x86_64-linux-gnu/libodbc.so \
    && ln -sf /usr/lib/x86_64-linux-gnu/libodbcinst.so.2 /usr/lib/x86_64-linux-gnu/libodbcinst.so
RUN pecl install sqlsrv-5.10.1 pdo_sqlsrv-5.10.1 \
    && echo "; priority=20\nextension=sqlsrv.so\n" > /usr/local/etc/php/conf.d/sqlsrv.ini \
    && echo "; priority=30\nextension=pdo_sqlsrv.so\n" > /usr/local/etc/php/conf.d/pdo_sqlsrv.ini

# Configurar e instalar extensões PHP comuns
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo mbstring exif pcntl bcmath gd

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Definir permissões adequadas
RUN chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html
