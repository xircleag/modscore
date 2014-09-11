FROM registry.infra.layer.com/vendor-jsframework:1.2.0

ADD . /opt/modscore/

RUN \
    cd /opt/modscore/ && \
    npm install && \
    grunt jasmine
