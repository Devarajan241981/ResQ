cmake_minimum_required(VERSION 3.16)
project(resq_native C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release)
endif()
set(CMAKE_C_FLAGS_RELEASE "-O3")

find_package(PkgConfig REQUIRED)
pkg_check_modules(JPEG REQUIRED IMPORTED_TARGET libjpeg)
pkg_check_modules(PNG REQUIRED IMPORTED_TARGET libpng)
pkg_check_modules(OPENSSL REQUIRED IMPORTED_TARGET libcrypto)
pkg_check_modules(QRENCODE REQUIRED IMPORTED_TARGET libqrencode)
find_package(Threads REQUIRED)

add_library(resq_native SHARED
    src/geo.c
    src/image.c
    src/crypto.c
    src/qr.c
)

target_include_directories(resq_native PUBLIC include)
target_link_libraries(resq_native
    PkgConfig::JPEG
    PkgConfig::PNG
    PkgConfig::OPENSSL
    PkgConfig::QRENCODE
    Threads::Threads
    m
)

set_target_properties(resq_native PROPERTIES
    OUTPUT_NAME "resq_native"
    PREFIX "lib"
)

install(TARGETS resq_native LIBRARY DESTINATION lib)
install(FILES include/resq_native.h DESTINATION include)
