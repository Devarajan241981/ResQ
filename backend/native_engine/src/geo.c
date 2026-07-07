#include "resq_native.h"

#include <math.h>

#define EARTH_RADIUS_KM 6371.0

static double deg2rad(double deg) {
    return deg * (M_PI / 180.0);
}

double resq_haversine_km(double lat1, double lng1, double lat2, double lng2) {
    double phi1 = deg2rad(lat1);
    double phi2 = deg2rad(lat2);
    double d_phi = deg2rad(lat2 - lat1);
    double d_lambda = deg2rad(lng2 - lng1);

    double a = sin(d_phi / 2.0) * sin(d_phi / 2.0)
             + cos(phi1) * cos(phi2) * sin(d_lambda / 2.0) * sin(d_lambda / 2.0);
    double c = 2.0 * asin(sqrt(a));
    return EARTH_RADIUS_KM * c;
}

int resq_is_within_radius(double lat1, double lng1, double lat2, double lng2, double radius_km) {
    return resq_haversine_km(lat1, lng1, lat2, lng2) <= radius_km ? 1 : 0;
}

void resq_radius_filter_batch(
    double origin_lat, double origin_lng, double radius_km,
    const double *lats, const double *lngs, size_t n,
    uint8_t *out_mask
) {
    for (size_t i = 0; i < n; i++) {
        out_mask[i] = resq_is_within_radius(origin_lat, origin_lng, lats[i], lngs[i], radius_km) ? 1 : 0;
    }
}

int resq_point_in_polygon(
    double lat, double lng,
    const double *polygon_lats, const double *polygon_lngs, size_t n
) {
    if (n < 3) {
        return 0;
    }

    int inside = 0;
    for (size_t i = 0, j = n - 1; i < n; j = i++) {
        double lat_i = polygon_lats[i], lng_i = polygon_lngs[i];
        double lat_j = polygon_lats[j], lng_j = polygon_lngs[j];

        int straddles = ((lat_i > lat) != (lat_j > lat));
        if (straddles) {
            double lng_intersect = lng_i + (lat - lat_i) * (lng_j - lng_i) / (lat_j - lat_i);
            if (lng < lng_intersect) {
                inside = !inside;
            }
        }
    }
    return inside;
}
