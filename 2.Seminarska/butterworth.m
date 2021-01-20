while true 
    prompt = 'Izberite željeni signal! (FP1=22, FP2=24) ';
    x = input(prompt);

    [sig, freq, tm] = rdsamp('S002R01.edf', x);

    high = 0.1;
    low = 30;
    threshold = 70;
    %threshold = 50;
    N = 4;
    %N = 20;

    % bandpass filter
    [b, a] = butter(4, [high low] / (freq/2), 'bandpass');
    sig = filtfilt(b, a, sig); 

    %prikaz pred odstranjevanjem artefaktov
    tiledlayout('flow')
    nexttile
    plot(tm, sig)
    ylim([-500 500])

    %odstranjevanje artefaktov
    for i = 1 : length(sig)
        if abs(sig(i)) > threshold
            sig(i) = 0;
            for j = 1 : (N/2)
               sig(i-j) = 0;
               sig(i+j) = 0;
            end
        end
    end

    %prikaz po odstranjevanjem artefaktov
    nexttile
    plot(tm, sig)
    ylim([-500 500])
end
