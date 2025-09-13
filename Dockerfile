FROM php:7.4-fpm

# Install system dependencies
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
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add Microsoft repository for ODBC (Debian Buster)
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql17 odbcinst1debian2 \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo mbstring exif pcntl bcmath gd

# Clean up problematic .la files and fix ODBC linking issues
RUN find /usr -name "*.la" -delete 2>/dev/null || true \
    && ln -sf /usr/lib/x86_64-linux-gnu/libodbc.so.2 /usr/lib/x86_64-linux-gnu/libodbc.so \
    && ln -sf /usr/lib/x86_64-linux-gnu/libodbcinst.so.2 /usr/lib/x86_64-linux-gnu/libodbcinst.so

# Install SQL Server drivers (compatible versions for PHP 7.4)
RUN pecl install sqlsrv-5.9.0 pdo_sqlsrv-5.9.0 \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html

WORKDIR /var/www/html