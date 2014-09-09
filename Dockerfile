FROM registry.infra.layer.com/vendor-nodejs:1.0.0

ADD . /opt/modscore/

RUN \
    cd /opt/modscore/ && \
    grunt jasmine
