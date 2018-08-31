#include <stdio.h>
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <stdlib.h>

using namespace std;

int main()
{
  pid_t pid = fork();
  const char * compile[]={"sudo", "g++", "./submit_codes/compileThis.c", "-o", "./convertToExe/compileComplete", NULL};

  if(pid == -1){
    perror("fork");
  } else if(pid == 0) {
    //child
    execvp(compile[0], (char * const *)compile);
    exit(0);
  } else {
    //parent
    if( wait(0) == -1 ){
      perror("wait");
    }
  }
  return 0;
}

