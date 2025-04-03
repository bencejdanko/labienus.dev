#include <string.h>

char* process_string(const char* input) {
  size_t length = strlen(input);
  char* result = (char*)malloc(length+10);
  strcopy(result, "process: ");
  strcat(result, input);
  return result;
}
