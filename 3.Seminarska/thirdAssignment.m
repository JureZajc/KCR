function thirdAssignment(subj, rec) 
  db = "DB";
  subject = string(subj);
  record=[];
  for i=0:2
      record = [record string(num2str(rec+(i*4), '%02d'))]; %combine name of subject
  end
  act1Set = {};
  act2Set = {};

  for i=1:size(record,2)
    if (strcmp(db,"")==0) 
      recName=strcat("/",db,"/",subject,"/",subject,"R",record(:,i),".edf"); %whole name of record
    else
      recName=strcat(subject,'R',record(i),'.edf');
    end
    recName=convertStringsToChars(recName);
    disp(recName);
    [sig, fs, tm] = rdsamp(recName, 1:64); %read sample
    [T0, T1, T2] = getIntervals(recName,'event', fs, size(sig,1)); %get intervals
    sig=sig';
    output=strcat("Reading intervals for record: ",recName); %test test test
    disp(output);
    for j=1:size(T1, 1)
      act1Set{end+1}=sig(:, T1(j,1):T1(j,2));
    end
    for j=1:size(T2,1)
      act2Set{end+1}=sig(:, T2(j,1):T2(j,2));
    end
  end
  
      f = [0 8 8 13 13 fs/2]/(fs/2); %filter
      a = [0 0 1 1 0 0 ]; % 8-13 Hz (cause where is 1)
      n= 35; 
      b = firls(n, f, a);

      output=strcat("CSP for subject: ",subj); %CSP
      disp(output);
      [W] = f_CSP( cell2mat(act1Set(1)),  cell2mat(act2Set(1))); %CSP over subject

      act1Set(1)=[];
      act2Set(1)=[];

      feature1=[];
      feature2=[];

      for i=1:size(act1Set,2)
          
          tmp = (W*cell2mat(act1Set(i)));
          tmp = [tmp(1,:).', tmp(size(tmp,1),:).' ].';
          tmp = filter(b, 1, tmp); %filter
          feature1(i,1) = log(var(tmp(1,:)));
          feature1(i,2) = log(var(tmp(2,:)));      
      end
      for i=1:size(act2Set,2)
          
          tmp = (W*cell2mat(act2Set(i)));
          tmp = [tmp(1,:).', tmp(size(tmp,1),:).' ].';
          tmp = filter(b, 1, tmp);
          feature2(i,1) = log(var(tmp(1,:)));
          feature2(i,2) = log(var(tmp(2,:)));      
      end

%scatter plot
      scatter(feature1(:,1), feature1(:,2));
      hold on
      scatter(feature2(:,1), feature2(:,2)); 
%Files needed for classification, same name like in example, just added
%before subject
      featVFile = strcat(subject,'featureVectors.txt');
      classFile = strcat(subject,'referenceClass.txt');

      featureVecFile = fopen(featVFile, "wt");
      refClassFile = fopen(classFile, "wt");
%writing into files
      for i=1:size(feature1,1)
          fprintf(featureVecFile, "%.8f %.8f\n", feature1(i,1), feature1(i,2));
          fprintf(refClassFile, "T1\n");
      end

      for i=1:size(feature2,1)
          fprintf(featureVecFile, "%.8f %.8f\n", feature2(i,1), feature2(i,2));
          fprintf(refClassFile, "T2\n");
      end
      fclose(featureVecFile);
      fclose(refClassFile);
      
end

function [newVectors, meanValue] = remmean(vectors)
  newVectors = zeros (size (vectors));
  meanValue = mean (vectors')';
  newVectors = vectors - meanValue * ones (1,size (vectors, 2));
end

%functions from ucilnica
function [T0,T1, T2] = getIntervals(recName, anotator, fs, siglen)
% function returns arrays of interval start and stop times in samples 
% for the three different interval types; the meaning of annotations (T1,
% T2, T3) is determined according to the record number;
% input arguments:
%   - recName: string containing record name e.g 'S001R03.edf'
%   - anotator: string containing annotator name e.g. 'event'
%   - fs: sampling frequency of the record e.g. 160
%   - siglen: length of a data file in samples
% output arguments:
%   - T0: array of start and end times in samples for interval T0
%   - T1: array of start and end times in samples for interval T1
%   - T2: array of start and end times in samples for interval T2
  T0=[];
  T1=[];
  T2=[];
  [a, t, s, c, n, cmt] = rdann(recName, anotator);
  cmt=string(cmt);
  for i=1:size(a,1)
    splt=strsplit(cmt(i), " ");
    dur=str2double(splt(3))*fs;
    if (i<size(a,1)) 
        stop=a(i+1)-1;
    else
        stop=a(i)+dur;
    end
    stop = min(stop, siglen);
    if (splt(1)=="T0") 
      T0=[T0; [a(i) stop]];
    elseif (splt(1)=="T1")
      T1=[T1; [a(i) stop]];
    elseif (splt(1)=="T2")
      T2=[T2; [a(i) stop]];
    end
  end
end

function [result] = f_CSP(varargin)
% This code is for calulating the projection matrix for CSP 
% Haider Raza, Intelligent System Research Center, University of Ulster, Northern Ireland, UK.
%     Raza-H@email.ulster.ac.uk
%     Date: 03-Oct-2014
% Input:
%             
%       left:  left hand data
%       right: right hand data
% 
% Output:
%        left: Left hand data
%        right: right hand data    

    if (nargin ~= 2)
        disp('Must have 2 classes for CSP!')
    end
    
    Rsum=0;
    %finding the covariance of each class and composite covariance
    for i = 1:nargin 
        %mean here?
        R{i} = ((varargin{i}*varargin{i}')/trace(varargin{i}*varargin{i}'));%instantiate me before the loop!
        %Ramoser equation (2)
        Rsum=Rsum+R{i};
    end
   
    %   Find Eigenvalues and Eigenvectors of RC
    %   Sort eigenvalues in descending order
    [EVecsum,EValsum] = eig(Rsum);
    [EValsum,ind] = sort(diag(EValsum),'descend');
    EVecsum = EVecsum(:,ind);
    
    %   Find Whitening Transformation Matrix - Ramoser Equation (3)
        W = sqrt(inv(diag(EValsum))) * EVecsum';
    
    
    for k = 1:nargin
        S{k} = W * R{k} * W'; %       Whiten Data Using Whiting Transform - Ramoser Equation (4)
    end
   
    %generalized eigenvectors/values
    [B,D] = eig(S{1},S{2});
    % Simultanous diagonalization
			% Should be equivalent to [B,D]=eig(S{1});
    
    [D,ind]=sort(diag(D));B=B(:,ind);
    
    %Resulting Projection Matrix-these are the spatial filter coefficients
    result = B'*W;

end