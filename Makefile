all:
	-docker compose up -d --build

stop:
	-docker compose stop

clean: stop
	-docker compose down --volumes --remove-orphans

fclean: clean
	-docker system prune -af --volumes 2> /dev/null

re: stop all

.PHONY: all stop clean fclean re
