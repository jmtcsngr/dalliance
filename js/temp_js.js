function RangerBAMFeatureSource (bamSource) {
    BAMFeatureSource.call(this, bamSource);
}

RangerBAMFeatureSource.prototype = Object.create(BAMFeatureSource.prototype);    

RangerBAMFeatureSource.prototype.init = function () {
}

RangerBAMFeatureSource.prototype.fetch = function(chr, min, max, scale, types, pool, callback) {
    var bamF;
    var thisB = this;
    var url = thisB.bamSource.bamURI + '&region=' + chr +"%3A" + min + "-" + max;
    bamF = new URLFetchable(url, {credentials: thisB.opts.credentials});

    makeBam3(bamF, null, null, function (bam, err) {
        thisB.readiness = null;
        thisB.notifyReadiness();

        if ( bam ) {
            thisB.bamHolder.provide( bam );
        } else {
            thisB.error = err;
            thisB.bamHolder.provide(null);
        }
    });

    var ligth = types && (types.length == 1) && (types[0] == 'density');

    thisB.busy++;
    thisB.notifyActivity();
    
    this.bamHolder.await(function(bam) {
        if (!bam) {
            thisB.busy--;
            thisB.notifyActivity();
            return callback(thisB.error || "Couldn't fetch BAM");
        }
        
        if ( bam.records ) {
            var features = [];
            for ( var ri = 0; ri < bam.records.length; ri++ ) {
                var r = bam.records[ri], f = bamRecordToFeature(r, thisB.opts.bamGroup);
                if (f) {
                    features.push(f);
                }
            }
            callback (null, features, 1000000000);
        }
    }
}
