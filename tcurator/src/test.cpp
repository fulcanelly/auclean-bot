#include <iostream>
#include <type_traits>

// Example compile-time check (simple numeric check for demonstration)
template <int N>
struct Validate {
    static_assert(int(N) > 0 && N < 100, "Number must be between 1 and 99");
};

int main() {
    Validate<10> validNumber; // This will compile
    // Validate<-1> invalidNumber; // This will not compile due to static_assert
    return 0;
}
