apt-get install build-essential autoconf re2c bison libssl-dev libcurl4-openssl-dev pkg-config libpng-dev libxml2-dev libxml2 libcurl3

cd /usr/src

wget http://de1.php.net/get/php-7.0.4.tar.bz2/from/this/mirror -O php-7.0.4.tar.bz2
tar -xvjf php-7.0.4.tar.bz2

cd php-7.0.4

./buildconf --force
CONFIGURE_STRING="--prefix=/usr/local/php-fpm 
--enable-fpm
--enable-mysqlnd
--enable-mbstring
--enable-pdo
--disable-phar
--with-config-file-scan-dir=/usr/local/php-fpm/etc/conf.d
--with-curl
--with-gd
--with-mcrypt
--with-fpm-user=www-data
--with-fpm-group=www-data
--with-mysql-sock=/var/run/mysqld/mysqld.sock
--with-mysqli=mysqlnd
--with-zlib
--with-jpeg-dir=/usr
--with-png-dir=/usr
--with-zlib-dir=/usr
--with-xpm-dir=/usr
--with-freetype-dir=/usr
--enable-gd-native-ttf
--enable-gd-jis-conv
--with-openssl
--with-pdo-mysql=/usr
--with-gettext=/usr
--with-zlib=/usr
--with-bz2=/usr
--with-recode=/usr
--without-pdo-sqlite"

./configure $CONFIGURE_STRING
make && make install

cp /usr/src/php-7.0.4/php.ini-production /usr/local/php-fpm/lib/php.ini

mkdir -p /usr/local/php-fpm/etc/conf.d/
nano /usr/local/php-fpm/etc/conf.d/modules.ini
Скопируйте в него следующие параметры:
# Zend OPcache
zend_extension=opcache.so

Для настройки работы PHP-FPM создайте файл:
nano /usr/local/php-fpm/etc/php-fpm.conf
И добавьте в него следующие параметры:
[global]

pid = /var/run/php-fpm.pid
error_log = /var/log/php-fpm.log

include=/usr/local/php-fpm/etc/php-fpm.d/*.conf

Затем создайте файл:
nano /usr/local/php-fpm/etc/php-fpm.d/www.conf
И добавьте в него параметры:
[www]
user = www-data
group = www-data

listen = /var/run/php7-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0777

pm = dynamic
pm.max_children = 5
pm.start_servers = 2
pm.min_spare_servers = 1
pm.max_spare_servers = 3

Добавим PHP 7 в автозагрузку, создадим символическую ссылку на файл php-fpm:

ln -s /usr/local/php-fpm/sbin/php-fpm /usr/local/php-fpm/sbin/php7-fpm
Создадим в каталоге init.d скрипт для запуска PHP-FPM:

nano /etc/init.d/php-fpm
Добавьте в содержимое файла:

#! /bin/sh

### BEGIN INIT INFO
# Provides:          php-fpm
# Required-Start:    $remote_fs $network
# Required-Stop:     $remote_fs $network
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: starts php-fpm
# Description:       starts the PHP FastCGI Process Manager daemon
### END INIT INFO

prefix=/usr/local/php-fpm
exec_prefix=${prefix}

php_fpm_BIN=${exec_prefix}/sbin/php-fpm
php_fpm_CONF=${prefix}/etc/php-fpm.conf
php_fpm_conf_PID=$(sed -n 's/^pid[ =]*//p' $php_fpm_CONF)
php_fpm_PID=${php_fpm_conf_PID:-/var/run/php-fpm.pid}

php_opts="--fpm-config $php_fpm_CONF --pid $php_fpm_PID"


wait_for_pid () {
	try=0

	while test $try -lt 35 ; do

		case "$1" in
			'created')
			if [ -f "$2" ] ; then
				try=''
				break
			fi
			;;

			'removed')
			if [ ! -f "$2" ] ; then
				try=''
				break
			fi
			;;
		esac

		echo -n .
		try=`expr $try + 1`
		sleep 1

	done

}

case "$1" in
	start)
		echo -n "Starting php-fpm "

		$php_fpm_BIN --daemonize $php_opts

		if [ "$?" != 0 ] ; then
			echo " failed"
			exit 1
		fi

		wait_for_pid created $php_fpm_PID

		if [ -n "$try" ] ; then
			echo " failed"
			exit 1
		else
			echo " done"
		fi
	;;

	stop)
		echo -n "Gracefully shutting down php-fpm "

		if [ ! -r $php_fpm_PID ] ; then
			echo "warning, no pid file found - php-fpm is not running ?"
			exit 1
		fi

		kill -QUIT `cat $php_fpm_PID`

		wait_for_pid removed $php_fpm_PID

		if [ -n "$try" ] ; then
			echo " failed. Use force-quit"
			exit 1
		else
			echo " done"
		fi
	;;

	status)
		if [ ! -r $php_fpm_PID ] ; then
			echo "php-fpm is stopped"
			exit 0
		fi

		PID=`cat $php_fpm_PID`
		if ps -p $PID | grep -q $PID; then
			echo "php-fpm (pid $PID) is running..."
		else
			echo "php-fpm dead but pid file exists"
		fi
	;;

	force-quit)
		echo -n "Terminating php-fpm "

		if [ ! -r $php_fpm_PID ] ; then
			echo "warning, no pid file found - php-fpm is not running ?"
			exit 1
		fi

		kill -TERM `cat $php_fpm_PID`

		wait_for_pid removed $php_fpm_PID

		if [ -n "$try" ] ; then
			echo " failed"
			exit 1
		else
			echo " done"
		fi
	;;

	restart)
		$0 stop
		$0 start
	;;

	reload)

		echo -n "Reload service php-fpm "

		if [ ! -r $php_fpm_PID ] ; then
			echo "warning, no pid file found - php-fpm is not running ?"
			exit 1
		fi

		kill -USR2 `cat $php_fpm_PID`

		echo " done"
	;;

	configtest)
		$php_fpm_BIN -t
	;;

	*)
		echo "Usage: $0 {start|stop|force-quit|restart|reload|status|configtest}"
		exit 1
	;;

esac

view rawphp7-fpm hosted with ❤ by GitHub
Дадим права на запуск, добавим скрипт в автозагрузку:

chmod +x /etc/init.d/php-fpm
update-rc.d php-fpm defaults
Затем необходимо выполнить команду:

service php-fpm restart
