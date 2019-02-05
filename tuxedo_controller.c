#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#define TUX_SYS "/sys/devices/platform/tuxedo_keyboard/"

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
    printf("%s = %d\n",value,len);
    handle = sysopen(param);
    if (handle>=0) {
        write(handle, value, len);
        close(handle);
    }
}

int main() {
    //setparam("mode", "0");
    return 0;
}