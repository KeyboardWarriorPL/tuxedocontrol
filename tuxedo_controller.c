#include <syslog.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#define TUX_SYS "/sys/devices/platform/tuxedo_keyboard/"

typedef struct {
    char* name;
    char* value;
} Param;

char* strappend(char* left, char* right) {
    int lenl, lenr, i;
    char* whole;
    lenl = strlen(left);
    lenr = strlen(right);
    whole = malloc(sizeof(char)*(lenl+strlen(right)));
    for (i = 0; i < lenl; i++) {
        whole[i] = left[i];
    }
    for (i = lenl; i-lenl < lenr; i++) {
        whole[i] = right[i - lenl];
    }
    return whole;
}

int sysopen(char* f) {
    char* path = TUX_SYS;
    path = strappend(path, f);
    return open(path, O_WRONLY);
}

void setparam(char* param, char* value) {
    int handle, len;
    len = strlen(value);
    handle = sysopen(param);
    if (handle>=0) {
        openlog("tuxedo_controller", LOG_CONS, LOG_LOCAL1);
        syslog(LOG_NOTICE, "Writing %s with %s\n",param,value);
        closelog();
        write(handle, value, len);
        close(handle);
    }
}

void setwithparam(Param p) {
    setparam(p.name, p.value);
}

void loadArgs(int lp, Param opt[lp], int ac, char* av[]) {
    int i, a = 2;
    opt[0] = (Param){"mode", "0"};
    for (i = 1; i < lp; i++) {
        if (a < ac) {
            opt[i] = (Param){av[a-1], av[a]};
            a += 2;
        }
        else {
            opt[i] = (Param){NULL, NULL};
        }
    }
}

int main(int argc, char* argv[]) {
    int x;
    Param options[5];
    loadArgs(5, options, argc, argv);
    for (x = 0; x < 5; x++) {
        if (options[x].name!=NULL) {
            setwithparam(options[x]);
        }
    }
    return 0;
}